import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield,
  Users,
  Target,
  Heart,
  CheckCircle,
  ArrowRight,
  Briefcase,
  FileText,
  Globe,
  Lock
} from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description: "Every company and organization is verified before posting. We never hide fees or conditions.",
  },
  {
    icon: Users,
    title: "Equal Opportunity",
    description: "We believe every Syrian deserves access to quality job and tender opportunities regardless of background.",
  },
  {
    icon: Target,
    title: "Quality First",
    description: "We curate listings to ensure relevance and authenticity. No spam, no scams.",
  },
  {
    icon: Heart,
    title: "Community Focus",
    description: "Built by Syrians, for Syrians. We understand local needs and challenges.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Sign up for free as a job seeker, company, or organization.",
  },
  {
    step: "02",
    title: "Get Verified",
    description: "Companies and organizations undergo admin verification for authenticity.",
  },
  {
    step: "03",
    title: "Post or Apply",
    description: "Post opportunities or apply to listings with just a few clicks.",
  },
  {
    step: "04",
    title: "Connect & Succeed",
    description: "Review applications, conduct interviews, and find the perfect match.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-hero py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Connecting Syrian Talent with
                <span className="text-gradient-primary block mt-2">Real Opportunities</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                RT-SYR is Syria's trusted platform for job seekers and tender opportunities. 
                We bridge the gap between talented individuals and reputable organizations, 
                all without charging applicants a single fee.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/signup">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/jobs">Browse Opportunities</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6">
                  Our Mission
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  We believe that access to quality employment and business opportunities should be 
                  free and accessible to all Syrians. Our platform was built to eliminate the barriers 
                  that often stand between talented individuals and their next career milestone.
                </p>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Whether you're a recent graduate looking for your first job, a professional seeking 
                  new challenges, or a business owner looking to find qualified vendors through tender 
                  processes—RT-SYR is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10">
                    <Briefcase className="w-6 h-6 text-success" />
                    <div>
                      <div className="font-semibold text-foreground">Free Job Applications</div>
                      <div className="text-sm text-muted-foreground">No fees for job seekers</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10">
                    <FileText className="w-6 h-6 text-accent" />
                    <div>
                      <div className="font-semibold text-foreground">Free Tender Proposals</div>
                      <div className="text-sm text-muted-foreground">No fees for vendors</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-card rounded-2xl p-8 border border-border">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-6 rounded-xl bg-primary/5">
                      <div className="text-3xl font-bold text-primary mb-1">10K+</div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-accent/5">
                      <div className="text-3xl font-bold text-accent mb-1">500+</div>
                      <div className="text-sm text-muted-foreground">Opportunities</div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-success/5">
                      <div className="text-3xl font-bold text-success mb-1">200+</div>
                      <div className="text-sm text-muted-foreground">Companies</div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-info/5">
                      <div className="text-3xl font-bold text-info mb-1">150+</div>
                      <div className="text-sm text-muted-foreground">Organizations</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Our Values
              </h2>
              <p className="text-muted-foreground">
                The principles that guide everything we do at RT-SYR.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div 
                  key={value.title}
                  className="bg-card rounded-xl p-6 border border-border animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground">
                Getting started with RT-SYR is quick and easy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, index) => (
                <div 
                  key={item.step}
                  className="relative animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 right-0 w-1/2 border-t-2 border-dashed border-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security note */}
        <section className="py-16 lg:py-24 bg-primary/5">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-success" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Your Trust is Our Priority
              </h2>
              <p className="text-muted-foreground mb-6">
                We take security seriously. All data is encrypted, all companies and organizations 
                are verified, and we never share your personal information without your consent.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>No fees for applicants</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Verified listings only</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Report suspicious activity</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
