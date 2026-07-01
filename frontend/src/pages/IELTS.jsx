import { GraduationCap } from "lucide-react";
import LessonSection from "../components/LessonSection.jsx";
import { useLang } from "../i18n/LanguageProvider";

export default function IELTS() {
    const { t } = useLang();
    return (
        <LessonSection
            category="ielts"
            accent="from-sky-500 via-blue-600 to-indigo-600"
            title={t.navIelts}
            subtitle={t.ieltsSub}
            icon={<GraduationCap size={26} className="text-white" />}
        />
    );
}
