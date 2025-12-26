import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { Mail } from "lucide-react";

interface Company {
    name: string;
    email: string;
    description: string;
    logo: string;
}

const companies: Company[] = [
    {
        name: "SCRM Global",
        email: "info@scrmglobal.com",
        description: "Solutions Consultancy Research & Monitoring",
        logo: "/logos/scrm-global.jpeg",
    },
    {
        name: "SHARE",
        email: "info@shareorg.org",
        description: "Serving Humanity with Aid Relief Education",
        logo: "/logos/share.jpeg",
    },
];

export function CompaniesSlider() {
    const { t } = useTranslation();
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    // Auto-play functionality
    useEffect(() => {
        if (!api) return;

        const interval = setInterval(() => {
            api.scrollNext();
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [api]);

    return (
        <div className="w-full mt-12 animate-fade-up" style={{ animationDelay: "0.5s" }}>
            <div className="text-center mb-4">
                <p className="text-xs text-muted-foreground font-medium">
                    {t('home.hero.trustedBy')}
                </p>
            </div>
            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full max-w-3xl mx-auto"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {companies.map((company, index) => (
                        <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2">
                            <div className="group relative bg-card rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                                <div className="flex flex-col items-center text-center space-y-3">
                                    {/* Logo Image */}
                                    <div className="w-20 h-20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                        <img
                                            src={company.logo}
                                            alt={`${company.name} logo`}
                                            className="max-w-full max-h-full object-contain rounded-lg"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Company name */}
                                    <div>
                                        <h3 className="font-display text-base font-bold text-foreground mb-1">
                                            {company.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                                            {company.description}
                                        </p>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Mail className="w-3 h-3" />
                                        <a
                                            href={`mailto:${company.email}`}
                                            className="hover:text-primary transition-colors"
                                        >
                                            {company.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-8 h-8 w-8 border-border/50 hover:border-primary" />
                <CarouselNext className="hidden md:flex -right-8 h-8 w-8 border-border/50 hover:border-primary" />

                {/* Dots indicator */}
                <div className="flex items-center justify-center gap-2 mt-4">
                    {companies.map((_, index) => (
                        <button
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === current
                                    ? "w-6 bg-primary"
                                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                }`}
                            onClick={() => api?.scrollTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </Carousel>
        </div>
    );
}

