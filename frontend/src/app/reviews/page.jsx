import StudentReviewsSection from "@/components/StudentReviewsSection";

export const metadata = {
  title: "Student Reviews – MessMate AI",
  description: "Verified student reviews and hygiene ratings for messes.",
};

export default function ReviewsPage() {
  return (
    <div className="py-6">
      <StudentReviewsSection />
    </div>
  );
}
