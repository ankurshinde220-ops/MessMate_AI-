from app.db.session import SessionLocal, Base, engine
from app.models.mess import Mess
from app.models.menu import Menu
from app.models.review import Review

SAMPLE_MESSES = [
    {
        "name": "Annapurna Pure Veg Mess",
        "description": "Traditional Maharashtrian and North Indian homestyle meals. Famous for unlimited fresh rotis, Dal Tadka, and Sunday Gulab Jamun.",
        "address": "Opposite Fergusson College Main Gate, FC Road, Shivajinagar",
        "city": "Pune",
        "landmark": "Near FC College Gate 2",
        "latitude": 18.5236,
        "longitude": 73.8415,
        "diet_type": "veg",
        "monthly_price": 3200.0,
        "per_meal_price": 85.0,
        "average_rating": 4.6,
        "hygiene_rating": 4.7,
        "total_reviews": 42,
        "cuisine_tags": "Pure Veg, Maharashtrian, North Indian, Unlimited Thali",
        "amenities": "RO Water, AC Dining Room, Parcel Service, Clean Restrooms",
        "image_urls": "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80",
        "contact_phone": "+91 98230 11223",
        "opening_hours": "7:30 AM - 10:30 PM",
        "is_verified": True
    },
    {
        "name": "Sai Krupa Deluxe Mess & Dining",
        "description": "Student-friendly mess with special Punjabi gravies, chicken curries on Wed/Sun, and everyday unlimited rice & chapati.",
        "address": "Lane 4, Paud Road, Kothrud",
        "city": "Pune",
        "landmark": "Behind MIT WPU College",
        "latitude": 18.5089,
        "longitude": 73.8152,
        "diet_type": "both",
        "monthly_price": 3600.0,
        "per_meal_price": 100.0,
        "average_rating": 4.4,
        "hygiene_rating": 4.3,
        "total_reviews": 58,
        "cuisine_tags": "Veg & Non-Veg, Punjabi, Mughlai, Rice Plate",
        "amenities": "WiFi, Water Purifier, Outdoor Seating, Monthly Tiffin",
        "image_urls": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80",
        "contact_phone": "+91 98221 44556",
        "opening_hours": "8:00 AM - 10:45 PM",
        "is_verified": True
    },
    {
        "name": "Navratna Jain & Marwadi Bhojanalaya",
        "description": "Specialized 100% Jain food cooked without onion and garlic. Authentic Marwadi Dal Baati on weekends, made in pure ghee.",
        "address": "Near Bharati Vidyapeeth Campus, Katraj",
        "city": "Pune",
        "landmark": "Opposite Bharati Vidyapeeth Central Library",
        "latitude": 18.4575,
        "longitude": 73.8508,
        "diet_type": "jain",
        "monthly_price": 3000.0,
        "per_meal_price": 80.0,
        "average_rating": 4.8,
        "hygiene_rating": 4.9,
        "total_reviews": 65,
        "cuisine_tags": "Jain, Marwadi, Rajasthani, Pure Ghee, No Onion Garlic",
        "amenities": "RO Water, Jain Kitchen, Hygienic Steel Tableware",
        "image_urls": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80",
        "contact_phone": "+91 97654 33211",
        "opening_hours": "7:00 AM - 9:30 PM",
        "is_verified": True
    },
    {
        "name": "Spice Route South & North Indian Mess",
        "description": "Crisp morning dosas & idlis, authentic Sambar, plus rich evening North Indian curries. Very popular with IT students and hostellers.",
        "address": "Datta Mandir Road, Viman Nagar",
        "city": "Pune",
        "landmark": "Near Symbiosis International School",
        "latitude": 18.5679,
        "longitude": 73.9143,
        "diet_type": "both",
        "monthly_price": 4000.0,
        "per_meal_price": 110.0,
        "average_rating": 4.5,
        "hygiene_rating": 4.6,
        "total_reviews": 89,
        "cuisine_tags": "South Indian, North Indian, Dosa, Thali, Non-Veg Sunday",
        "amenities": "Air Conditioned, Card/UPI Payments, Filter Coffee, CCTV",
        "image_urls": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Dosa_at_Sri_Ganesha_Restauran%2C_Bangkok_%2844570742744%29.jpg/960px-Dosa_at_Sri_Ganesha_Restauran%2C_Bangkok_%2844570742744%29.jpg",
        "contact_phone": "+91 99112 88776",
        "opening_hours": "7:00 AM - 11:00 PM",
        "is_verified": True
    },
    {
        "name": "Ghar Ka Swad Student Kitchen",
        "description": "Economical homestyle tiffin service and dine-in. Less oily food, perfect for long-term health and daily student life.",
        "address": "Model Colony, Deep Bungalow Chowk",
        "city": "Pune",
        "landmark": "Near BMCC College",
        "latitude": 18.5362,
        "longitude": 73.8344,
        "diet_type": "veg",
        "monthly_price": 2800.0,
        "per_meal_price": 75.0,
        "average_rating": 4.3,
        "hygiene_rating": 4.4,
        "total_reviews": 31,
        "cuisine_tags": "Homestyle, Low Oil, Pure Veg, Chapati Bhaji",
        "amenities": "Home Delivery, Tiffin Box Facility, Hygienic Kitchen",
        "image_urls": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
        "contact_phone": "+91 94220 55667",
        "opening_hours": "8:00 AM - 10:00 PM",
        "is_verified": True
    },
    {
        "name": "Kolhapuri Tadka & Homestyle Tiffin",
        "description": "Authentic Kolhapuri Tambada-Pandhara Rassa, fresh Jowar Bhakris, and spicy Khandeshi Sev Bhaji popular near Cummins College.",
        "address": "Cummins College Road, Karve Nagar",
        "city": "Pune",
        "landmark": "Opposite Cummins Engineering College Gate 1",
        "latitude": 18.4905,
        "longitude": 73.8190,
        "diet_type": "both",
        "monthly_price": 3400.0,
        "per_meal_price": 90.0,
        "average_rating": 4.6,
        "hygiene_rating": 4.5,
        "total_reviews": 134,
        "cuisine_tags": "Maharashtrian, Kolhapuri, Pithla Bhakri, Non-Veg",
        "amenities": "Hot Jowar Bhakri, Unlimited Solkadhi, RO Water",
        "image_urls": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Jhunka_Bhakri_Marathi_Food_by_Dr._Raju_Kasambe_DSCN0221_%288%29.jpg/960px-Jhunka_Bhakri_Marathi_Food_by_Dr._Raju_Kasambe_DSCN0221_%288%29.jpg",
        "contact_phone": "+91 98224 88990",
        "opening_hours": "8:00 AM - 10:30 PM",
        "is_verified": True
    }
]

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        count = db.query(Mess).count()
        if count == 0:
            print("[SEED] Seeding database with realistic student mess listings...")
            for mess_dict in SAMPLE_MESSES:
                mess = Mess(**mess_dict)
                db.add(mess)
                db.commit()
                db.refresh(mess)

                # Seed sample weekly menus for each
                days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                for day in days:
                    # Lunch
                    db.add(Menu(
                        mess_id=mess.id,
                        day_of_week=day,
                        meal_type="Lunch",
                        items="Paneer Masala / Seasonal Sabzi, Yellow Dal, 4 Phulkas, Steamed Rice, Salad",
                        is_special=(day in ["Wednesday", "Sunday"])
                    ))
                    # Dinner
                    db.add(Menu(
                        mess_id=mess.id,
                        day_of_week=day,
                        meal_type="Dinner",
                        items="Dal Makhani / Sev Bhaji, 4 Butter Rotis, Jeera Rice, Curd, Sweet",
                        is_special=(day == "Sunday")
                    ))
                
                # Seed reviews
                db.add(Review(
                    mess_id=mess.id,
                    author_name="Aditya Sharma (Engineering Student)",
                    rating=4.5,
                    hygiene_rating=4.8,
                    food_quality_rating=4.6,
                    comment="Been having meals here for 6 months. Cleanliness is top tier and rotis are always hot!"
                ))
                db.add(Review(
                    mess_id=mess.id,
                    author_name="Pooja Kulkarni",
                    rating=4.7,
                    hygiene_rating=4.5,
                    food_quality_rating=4.8,
                    comment="Best monthly subscription in this area. Highly recommended for students on a budget."
                ))
                db.commit()

            print("[OK] Database seeding completed successfully!")
        else:
            print(f"Database already contains {count} messes. Skipping initial seeding.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
