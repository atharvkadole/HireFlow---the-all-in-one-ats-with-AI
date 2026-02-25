import Analytics from "../components/Analytics";
import ResumeUploader from "../components/ResumeUploader";
import JDUploader from "../components/JDUploader";

export default function DashboardHome() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Analytics />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-full">
          <ResumeUploader />
        </div>
        <div className="h-full">
          <JDUploader />
        </div>
      </div>
    </div>
  );
}