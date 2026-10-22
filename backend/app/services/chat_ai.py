import json
import math
import re
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.mess import Mess
from app.models.menu import Menu
from app.schemas.chat import (
    ChatRequest, 
    ChatResponse, 
    ChatAction, 
    UserLocationContext
)
from app.services.recommendation import calculate_haversine_distance

class MessChatService:
    @staticmethod
    def _get_current_day_of_week() -> str:
        """Return the current day name (Monday, Tuesday, etc.)."""
        return datetime.utcnow().strftime("%A")

    @staticmethod
    def _fetch_mess_context(db: Session, user_loc: Optional[UserLocationContext] = None) -> List[Dict[str, Any]]:
        """Fetch all messes from the database with today's menus and calculated distances."""
        messes: List[Mess] = db.query(Mess).all()
        today = MessChatService._get_current_day_of_week()

        mess_list = []
        for m in messes:
            # Fetch menus for this mess
            menus = db.query(Menu).filter(Menu.mess_id == m.id).all()
            today_lunch = None
            today_dinner = None
            for menu in menus:
                if menu.day_of_week.lower() == today.lower():
                    if "lunch" in menu.meal_type.lower():
                        today_lunch = menu.items
                    elif "dinner" in menu.meal_type.lower():
                        today_dinner = menu.items

            distance_km = None
            if user_loc and user_loc.permission_granted and user_loc.lat is not None and user_loc.lng is not None:
                distance_km = calculate_haversine_distance(
                    user_loc.lat, user_loc.lng, m.latitude, m.longitude
                )

            mess_dict = {
                "id": m.id,
                "name": m.name,
                "address": m.address,
                "city": m.city,
                "landmark": m.landmark or "",
                "latitude": m.latitude,
                "longitude": m.longitude,
                "diet_type": m.diet_type,
                "monthly_price": m.monthly_price,
                "per_meal_price": m.per_meal_price,
                "average_rating": m.average_rating,
                "hygiene_rating": m.hygiene_rating,
                "total_reviews": m.total_reviews,
                "cuisine_tags": m.cuisine_tags or "",
                "amenities": m.amenities or "",
                "contact_phone": m.contact_phone or "Not listed",
                "opening_hours": m.opening_hours or "8:00 AM - 10:30 PM",
                "distance_km": distance_km,
                "today_lunch": today_lunch,
                "today_dinner": today_dinner,
                "directions_url": f"https://www.google.com/maps/dir/?api=1&destination={m.latitude},{m.longitude}"
            }
            mess_list.append(mess_dict)

        # Sort by distance if location provided
        if user_loc and user_loc.permission_granted and user_loc.lat is not None and user_loc.lng is not None:
            mess_list.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else 9999.0)

        return mess_list

    @classmethod
    async def process_chat(cls, db: Session, request: ChatRequest) -> ChatResponse:
        user_msg = request.message.strip()
        user_msg_lower = user_msg.lower()
        messes = cls._fetch_mess_context(db, request.user_location)
        today = cls._get_current_day_of_week()

        # Guardrail check: Consequential actions (booking, payment)
        if any(w in user_msg_lower for w in ["book", "booking", "pay", "payment", "buy subscription", "checkout"]):
            return cls._handle_consequential_booking_action(messes, user_msg)

        # If Gemini API Key is configured, attempt Gemini API with real database grounding
        if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5:
            try:
                gemini_res = await cls._query_gemini_api(user_msg, request.conversation_history, messes, today, request.user_location)
                if gemini_res:
                    return gemini_res
            except Exception as e:
                # Fallback to local grounded rule-based engine
                print(f"[Gemini API Warning] {e}. Falling back to internal grounded mess engine.")

        # Internal Grounded Engine
        return cls._grounded_local_response(user_msg, messes, today, request.user_location)

    @classmethod
    def _handle_consequential_booking_action(cls, messes: List[Dict[str, Any]], user_msg: str) -> ChatResponse:
        """Handle booking and payment requests with strict guardrails."""
        target_mess = None
        for m in messes:
            if m["name"].lower() in user_msg.lower():
                target_mess = m
                break
        
        reply = (
            "⚠️ **Notice on Meal Bookings & Payments:**\n\n"
            "MessMate AI is currently designed for mess discovery, menu reviews, hygiene verification, and navigation. "
            "Direct online meal booking or payment transactions are **not active** yet because they require a direct payment gateway integration with partner mess owners.\n\n"
        )

        if target_mess:
            reply += (
                f"To subscribe or book a meal at **{target_mess['name']}**:\n"
                f"- 📞 **Contact Manager:** {target_mess['contact_phone']}\n"
                f"- 📍 **Address:** {target_mess['address']} (Near {target_mess['landmark']})\n"
                f"- 💰 **Monthly Plan:** ₹{int(target_mess['monthly_price'])} / ₹{int(target_mess['per_meal_price'])} per meal\n"
                f"- 🕒 **Timings:** {target_mess['opening_hours']}\n\n"
                "Would you like me to open turn-by-turn directions to visit the mess in person?"
            )
            action = ChatAction(
                type="directions",
                title=f"Directions to {target_mess['name']}",
                data={
                    "mess": target_mess,
                    "directions_url": target_mess["directions_url"]
                }
            )
        else:
            reply += (
                "You can contact any mess manager directly using the phone numbers listed on their verified card, "
                "or visit them in person using our Directions link."
            )
            action = ChatAction(
                type="confirmation_alert",
                title="Payments Not Enabled",
                data={"status": "not_integrated"}
            )

        return ChatResponse(
            reply=reply,
            action=action,
            suggested_questions=[
                "Find the nearest mess",
                "Which mess fits my budget?",
                "What food is available today?"
            ],
            grounded_sources=[target_mess["name"]] if target_mess else [m["name"] for m in messes[:2]],
            ai_provider="messmate-grounded-ai"
        )

    @classmethod
    def _grounded_local_response(
        cls, 
        user_msg: str, 
        messes: List[Dict[str, Any]], 
        today: str, 
        user_loc: Optional[UserLocationContext]
    ) -> ChatResponse:
        user_msg_lower = user_msg.lower()
        has_location = bool(user_loc and user_loc.permission_granted and user_loc.lat is not None and user_loc.lng is not None)

        # 1. Location & Nearest Queries
        if any(q in user_msg_lower for q in ["nearest", "closest", "near me", "nearby", "around me", "within"]):
            # Extract radius if specified (e.g., "within 2 km", "within 1 km", "within 5 km")
            radius_match = re.search(r"within\s+(\d+(?:\.\d+)?)\s*(?:km|k\.m\.|kilometers)?", user_msg_lower)
            radius_km = float(radius_match.group(1)) if radius_match else 5.0

            if not has_location:
                return ChatResponse(
                    reply=(
                        "📍 **Permission Required for Proximity Search:**\n\n"
                        "To calculate exact distances and show messes sorted from nearest to farthest, "
                        "MessMate AI needs access to your current location.\n\n"
                        "Please click the **'Allow Location'** button below, or select your campus area."
                    ),
                    action=ChatAction(
                        type="ask_location",
                        title="Location Permission Required",
                        data={"reason": "Proximity sorting for messes within radius"}
                    ),
                    suggested_questions=[
                        "What food is available today?",
                        "Which mess fits my budget?",
                        "Show all Pune messes"
                    ],
                    grounded_sources=[m["name"] for m in messes[:3]],
                    ai_provider="messmate-grounded-ai"
                )

            # Filter messes by radius
            nearby = [m for m in messes if m["distance_km"] is not None and m["distance_km"] <= radius_km]
            if not nearby:
                # Fallback to closest available mess
                closest = messes[0] if messes else None
                return ChatResponse(
                    reply=(
                        f"No verified messes were found within **{radius_km} km** of your current location.\n\n"
                        f"The nearest available mess is **{closest['name']}**, approximately **{closest['distance_km']} km** away at {closest['address']}."
                    ),
                    action=ChatAction(
                        type="nearby_messes",
                        title=f"Closest Available Mess ({closest['distance_km']} km)",
                        data={"messes": [closest] if closest else [], "radius_km": radius_km}
                    ),
                    suggested_questions=[
                        f"Show messes within 10 km",
                        "Which mess fits my budget?",
                        "What food is available today?"
                    ],
                    grounded_sources=[closest["name"]] if closest else [],
                    ai_provider="messmate-grounded-ai"
                )

            # Build nearest messes reply
            lines = [f"Found **{len(nearby)} verified messes** within **{radius_km} km** of your location (sorted nearest to farthest):\n"]
            for idx, m in enumerate(nearby[:4], 1):
                diet_badge = "🌱 Pure Veg" if m["diet_type"] == "veg" else ("✨ Jain" if m["diet_type"] == "jain" else "🍗 Veg & Non-Veg")
                lines.append(
                    f"{idx}. **{m['name']}** — **{m['distance_km']} km away**\n"
                    f"   • {diet_badge} | Rating: {m['average_rating']}★ (Hygiene: {m['hygiene_rating']}★)\n"
                    f"   • Price: ₹{int(m['monthly_price'])}/mo (₹{int(m['per_meal_price'])}/meal)\n"
                    f"   • Landmark: {m['landmark'] or m['address']}"
                )

            lines.append("\nYou can click **'Get Directions'** on any card below to open turn-by-turn navigation.")

            return ChatResponse(
                reply="\n".join(lines),
                action=ChatAction(
                    type="nearby_messes",
                    title=f"Nearby Messes within {radius_km} km",
                    data={"messes": nearby, "radius_km": radius_km}
                ),
                suggested_questions=[
                    f"How do I reach {nearby[0]['name']}?",
                    "What food is available today?",
                    "Which mess fits my budget?"
                ],
                grounded_sources=[m["name"] for m in nearby],
                ai_provider="messmate-grounded-ai"
            )

        # 2. Budget Queries
        if any(q in user_msg_lower for q in ["budget", "price", "cost", "affordable", "cheap", "under", "per month", "monthly"]):
            # Extract budget amount if user typed numbers like 3000, 3200, 3500
            amount_match = re.search(r"(?:rs\.?|inr|₹)?\s*(\d{4})", user_msg_lower)
            target_budget = float(amount_match.group(1)) if amount_match else 3500.0

            affordable = [m for m in messes if m["monthly_price"] <= target_budget]
            affordable.sort(key=lambda x: x["monthly_price"])

            if not affordable:
                cheapest = min(messes, key=lambda x: x["monthly_price"])
                return ChatResponse(
                    reply=(
                        f"There are currently no messes strictly below **₹{int(target_budget)}/mo** in our verified database.\n\n"
                        f"The most economical option available is **{cheapest['name']}** at **₹{int(cheapest['monthly_price'])}/mo** "
                        f"(₹{int(cheapest['per_meal_price'])} per meal), located at {cheapest['address']}."
                    ),
                    action=ChatAction(
                        type="budget_compare",
                        title=f"Economical Options",
                        data={"messes": [cheapest], "target_budget": target_budget}
                    ),
                    suggested_questions=[
                        f"Messes under ₹{int(cheapest['monthly_price'] + 500)}",
                        "Find the nearest mess",
                        "What food is available today?"
                    ],
                    grounded_sources=[cheapest["name"]],
                    ai_provider="messmate-grounded-ai"
                )

            lines = [f"Here are the **{len(affordable)} student messes** that fit within your **₹{int(target_budget)}/mo** budget:\n"]
            for idx, m in enumerate(affordable, 1):
                savings = int(target_budget - m["monthly_price"])
                saving_text = f" (Saves ₹{savings}/mo)" if savings > 0 else " (Exact match)"
                lines.append(
                    f"{idx}. **{m['name']}** — **₹{int(m['monthly_price'])}/mo**{saving_text}\n"
                    f"   • Per meal: ₹{int(m['per_meal_price'])} | Rating: {m['average_rating']}★\n"
                    f"   • Diet: {m['diet_type'].capitalize()} | Area: {m['landmark'] or m['address']}"
                )

            return ChatResponse(
                reply="\n".join(lines),
                action=ChatAction(
                    type="budget_compare",
                    title=f"Messes under ₹{int(target_budget)}/mo",
                    data={"messes": affordable, "target_budget": target_budget}
                ),
                suggested_questions=[
                    f"What food is available today at {affordable[0]['name']}?",
                    f"How do I reach {affordable[0]['name']}?",
                    "Find the nearest mess"
                ],
                grounded_sources=[m["name"] for m in affordable],
                ai_provider="messmate-grounded-ai"
            )

        # 3. Today's Food / Menu Queries
        if any(q in user_msg_lower for q in ["food", "menu", "today", "lunch", "dinner", "special", "eat", "serving", "available"]):
            # Check if specific mess requested
            target_mess = None
            for m in messes:
                if m["name"].lower() in user_msg_lower:
                    target_mess = m
                    break

            if target_mess:
                lunch = target_mess["today_lunch"] or "Daily homestyle lunch (Specific items unlisted for today)"
                dinner = target_mess["today_dinner"] or "Daily homestyle dinner (Specific items unlisted for today)"
                reply = (
                    f"📅 **Today's Menu at {target_mess['name']} ({today}):**\n\n"
                    f"☀️ **Lunch:** {lunch}\n"
                    f"🌙 **Dinner:** {dinner}\n\n"
                    f"• **Diet Category:** {target_mess['diet_type'].capitalize()} ({target_mess['cuisine_tags']})\n"
                    f"• **Single Meal Price:** ₹{int(target_mess['per_meal_price'])}\n"
                    f"• **Timings:** {target_mess['opening_hours']}\n"
                    f"• **Contact:** {target_mess['contact_phone']}"
                )
                return ChatResponse(
                    reply=reply,
                    action=ChatAction(
                        type="menu_today",
                        title=f"{target_mess['name']} Today's Menu",
                        data={"mess": target_mess, "today": today, "lunch": lunch, "dinner": dinner}
                    ),
                    suggested_questions=[
                        f"How do I reach {target_mess['name']}?",
                        "Which mess fits my budget?",
                        "Find the nearest mess"
                    ],
                    grounded_sources=[target_mess["name"]],
                    ai_provider="messmate-grounded-ai"
                )

            # Overall summary for today
            lines = [f"📅 **Here is what's being served today ({today}) across top campus messes:**\n"]
            for m in messes[:3]:
                lunch_item = m["today_lunch"] or "Special Daily Homestyle Thali"
                dinner_item = m["today_dinner"] or "Evening Roti, Dal & Sabzi"
                lines.append(
                    f"• **{m['name']}** (₹{int(m['per_meal_price'])}/meal):\n"
                    f"   - **Lunch:** {lunch_item}\n"
                    f"   - **Dinner:** {dinner_item}\n"
                )

            lines.append("If you want the full weekly menu or specific dish photos, you can view each mess's detail page.")

            return ChatResponse(
                reply="\n".join(lines),
                action=ChatAction(
                    type="menu_today",
                    title=f"Today's Meals ({today})",
                    data={"messes": messes[:3], "today": today}
                ),
                suggested_questions=[
                    f"What food is available at {messes[0]['name']}?",
                    "Which mess fits my budget?",
                    "Find the nearest mess"
                ],
                grounded_sources=[m["name"] for m in messes[:3]],
                ai_provider="messmate-grounded-ai"
            )

        # 4. Directions Queries
        if any(q in user_msg_lower for q in ["reach", "direction", "directions", "route", "map", "locate", "where is", "address"]):
            target_mess = None
            for m in messes:
                # Check for word match in name
                name_words = [w.lower() for w in m["name"].split() if len(w) > 3]
                if any(w in user_msg_lower for w in name_words):
                    target_mess = m
                    break
            
            if not target_mess:
                target_mess = messes[0]

            dist_info = f" (~{target_mess['distance_km']} km from your location)" if target_mess["distance_km"] is not None else ""

            reply = (
                f"🧭 **Directions to {target_mess['name']}{dist_info}:**\n\n"
                f"• **Address:** {target_mess['address']}\n"
                f"• **Landmark:** {target_mess['landmark']}\n"
                f"• **City:** {target_mess['city']}\n"
                f"• **Contact Phone:** {target_mess['contact_phone']}\n"
                f"• **Hours:** {target_mess['opening_hours']}\n\n"
                f"Click the button below to launch Google Maps / OpenStreetMap turn-by-turn directions directly to this location."
            )

            return ChatResponse(
                reply=reply,
                action=ChatAction(
                    type="directions",
                    title=f"Directions to {target_mess['name']}",
                    data={
                        "mess": target_mess,
                        "directions_url": target_mess["directions_url"]
                    }
                ),
                suggested_questions=[
                    f"What food is available today at {target_mess['name']}?",
                    f"What is the monthly price of {target_mess['name']}?",
                    "Find the nearest mess"
                ],
                grounded_sources=[target_mess["name"]],
                ai_provider="messmate-grounded-ai"
            )

        # 5. Default General Recommendation / Question
        # Check for diet preferences
        if "jain" in user_msg_lower:
            matched = [m for m in messes if m["diet_type"] == "jain" or "jain" in m["cuisine_tags"].lower()]
        elif "veg" in user_msg_lower and "non" not in user_msg_lower:
            matched = [m for m in messes if m["diet_type"] in ["veg", "jain"]]
        elif "non-veg" in user_msg_lower or "chicken" in user_msg_lower:
            matched = [m for m in messes if m["diet_type"] == "both"]
        else:
            matched = messes

        lines = [
            f"Hello! I am **MessMate AI**, your campus food and mess recommendation assistant. "
            f"Here are top-rated student messes verified in our database:\n"
        ]

        for idx, m in enumerate(matched[:3], 1):
            dist_str = f" ({m['distance_km']} km away)" if m["distance_km"] is not None else ""
            lines.append(
                f"{idx}. **{m['name']}**{dist_str} — Rating: {m['average_rating']}★ (Hygiene: {m['hygiene_rating']}★)\n"
                f"   • Monthly: ₹{int(m['monthly_price'])} | Per meal: ₹{int(m['per_meal_price'])}\n"
                f"   • Cuisine: {m['cuisine_tags']} | Near {m['landmark'] or m['address']}"
            )

        lines.append(
            "\nYou can ask me:\n"
            "• *'Find the nearest mess'* (with GPS radius search)\n"
            "• *'Which mess fits my budget (e.g. ₹3200)?'*\n"
            "• *'What food is available today?'*\n"
            "• *'How do I reach Annapurna Mess?'*"
        )

        return ChatResponse(
            reply="\n".join(lines),
            action=ChatAction(
                type="nearby_messes",
                title="Verified Campus Messes",
                data={"messes": matched[:3]}
            ),
            suggested_questions=[
                "Find the nearest mess",
                "Show messes within 2 km",
                "Which mess fits my budget?",
                "What food is available today?"
            ],
            grounded_sources=[m["name"] for m in matched[:3]],
            ai_provider="messmate-grounded-ai"
        )

    @classmethod
    async def _query_gemini_api(
        cls, 
        user_msg: str, 
        history: List[Any], 
        messes: List[Dict[str, Any]], 
        today: str, 
        user_loc: Optional[UserLocationContext]
    ) -> Optional[ChatResponse]:
        """Calls Google Gemini API using the secure backend GEMINI_API_KEY with strict database grounding."""
        
        # Build clean JSON of verified messes to pass to Gemini
        verified_data = []
        for m in messes:
            verified_data.append({
                "id": m["id"],
                "name": m["name"],
                "address": m["address"],
                "landmark": m["landmark"],
                "diet_type": m["diet_type"],
                "monthly_price": m["monthly_price"],
                "per_meal_price": m["per_meal_price"],
                "average_rating": m["average_rating"],
                "hygiene_rating": m["hygiene_rating"],
                "distance_km": m["distance_km"],
                "today_lunch": m["today_lunch"],
                "today_dinner": m["today_dinner"],
                "cuisine_tags": m["cuisine_tags"],
                "opening_hours": m["opening_hours"],
                "contact_phone": m["contact_phone"],
                "directions_url": m["directions_url"]
            })

        system_instruction = (
            "You are MessMate AI, a smart and friendly campus mess recommendation assistant for college students. "
            "CRITICAL INSTRUCTIONS:\n"
            "1. You MUST strictly base your responses ONLY on the verified database provided in this prompt. "
            "NEVER invent or hallucinate messes, fake menus, or unlisted prices.\n"
            "2. If menu, price, or availability data is missing for any mess, clearly state: "
            "'This detail is not listed in our verified database; please check directly with the mess manager.'\n"
            "3. If the user asks to book a meal or make a payment, clearly explain that direct booking and payment "
            "integrations are not supported yet, and provide the mess manager's contact phone number and directions.\n"
            "4. Today's day of the week is: " + today + ".\n"
            "5. Student's current location status: " + 
            (f"Latitude: {user_loc.lat}, Longitude: {user_loc.lng} (Permission granted)" if (user_loc and user_loc.permission_granted) else "Permission NOT granted yet") + ".\n"
            "6. Keep answers concise, helpful, formatted in markdown with bullet points and bold titles."
        )

        prompt_payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": (
                                f"{system_instruction}\n\n"
                                f"=== VERIFIED MESS DATABASE (JSON) ===\n"
                                f"{json.dumps(verified_data, indent=2)}\n\n"
                                f"=== STUDENT'S MESSAGE ===\n"
                                f"{user_msg}"
                            )
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 800
            }
        }

        model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"

        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.post(
                api_url,
                json=prompt_payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                print(f"[Gemini API HTTP Error {response.status_code}]: {response.text}")
                return None

            res_json = response.json()
            candidates = res_json.get("candidates", [])
            if not candidates:
                return None

            content_parts = candidates[0].get("content", {}).get("parts", [])
            if not content_parts:
                return None

            reply_text = content_parts[0].get("text", "").strip()

            # Detect relevant action for the frontend
            action = None
            msg_lower = user_msg.lower()
            if any(w in msg_lower for w in ["nearest", "closest", "near me", "within", "1 km", "2 km", "3 km", "5 km"]):
                if user_loc and user_loc.permission_granted:
                    action = ChatAction(type="nearby_messes", title="Nearby Messes", data={"messes": messes[:4]})
                else:
                    action = ChatAction(type="ask_location", title="Location Permission", data={"reason": "Proximity sorting"})
            elif any(w in msg_lower for w in ["budget", "price", "under", "cheap", "affordable"]):
                action = ChatAction(type="budget_compare", title="Budget Options", data={"messes": messes[:3]})
            elif any(w in msg_lower for w in ["menu", "food", "today", "lunch", "dinner"]):
                action = ChatAction(type="menu_today", title=f"Today's Menu ({today})", data={"messes": messes[:3], "today": today})
            elif any(w in msg_lower for w in ["reach", "direction", "directions", "route"]):
                target = messes[0]
                for m in messes:
                    if m["name"].lower() in msg_lower:
                        target = m
                        break
                action = ChatAction(type="directions", title=f"Directions to {target['name']}", data={"mess": target, "directions_url": target["directions_url"]})

            return ChatResponse(
                reply=reply_text,
                action=action,
                suggested_questions=[
                    "Find the nearest mess",
                    "Which mess fits my budget?",
                    "What food is available today?"
                ],
                grounded_sources=[m["name"] for m in messes[:3]],
                ai_provider="gemini"
            )
