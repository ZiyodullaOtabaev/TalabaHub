import { Sparkles } from "lucide-react";
import LessonSection from "../components/LessonSection.jsx";
import { useLang } from "../i18n/LanguageProvider";

export default function Growth() {
    const { t } = useLang();
    return (
        <LessonSection
            category="growth"
            accent="from-fuchsia-500 via-purple-500 to-pink-500"
            title={t.navGrowth}
            subtitle={t.growthSub}
            icon={<Sparkles size={26} className="text-white" />}
        />
    );
}
