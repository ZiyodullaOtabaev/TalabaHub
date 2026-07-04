import { useEffect, useRef, useState } from "react";

/**
 * Element ekranga kirganda animatsiya qilish uchun hook.
 * 
 * Foydalanish:
 *   const { ref, isVisible } = useScrollReveal();
 *   <div ref={ref} className={isVisible ? "animate-fade-in-up" : "opacity-0"}>
 */
export function useScrollReveal(options = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(el); // Faqat bir marta animate
                }
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px", ...options }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
}

/**
 * Scroll reveal wrapper component.
 * 
 * <ScrollReveal> ... </ScrollReveal>
 */
export function ScrollReveal({ children, className = "", delay = 0 }) {
    const { ref, isVisible } = useScrollReveal();

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${
                isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
            } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
