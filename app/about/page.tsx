"use client";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Zap, Heart, Star, Target, Users, Rocket, Globe, Lightbulb, Crown, Shield, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import TeamStoryModal, { TeamMemberBio } from "@/components/TeamStoryModal";

const values = [
    {
        id: "engagement",
        label: "Engagement",
        icon: Zap,
        color: "text-yellow-400",
        desc: "Chaque membre s’implique activement dans la vie du club, respecte ses engagements et assume pleinement ses responsabilités. L’engagement se traduit par la participation régulière aux activités, le respect des délais et la contribution concrète aux projets. Grâce à cet engagement, les membres développent un fort sentiment d’appartenance, qu’ils transmettent dans leur environnement académique et associatif, assurant la continuité, la crédibilité et l’efficacité du club."
    },
    {
        id: "esprit",
        label: "Esprit entrepreneurial",
        icon: Target,
        color: "text-red-400",
        desc: "Le club encourage l’audace, la créativité et l’initiative, considérant l’échec comme une étape normale de l’apprentissage. Les membres sont incités à identifier des opportunités, proposer des solutions innovantes et transformer leurs idées en projets concrets et impactantes. Cette culture développe leur autonomie, résilience et capacité à agir dans un environnement complexe et évolutif, reflétant l’esprit entrepreneurial promu par le club."
    },
    {
        id: "impact",
        label: "Impact & Responsabilité",
        icon: Heart,
        color: "text-pink-400",
        desc: "Toutes les initiatives intègrent des principes d’éthique, de durabilité et de RSE, en tenant compte de leurs impacts économiques, sociaux et environnementaux. Les membres développent une conscience accrue de leur rôle en tant que futurs leaders responsables, capables de générer un impact positif et durable dans leur environnement et la société."
    },
    {
        id: "excellence",
        label: "Excellence & Professionnalisme",
        icon: Star,
        color: "text-primary",
        desc: "Le club agit avec rigueur, discipline et sérieux dans toutes ses activités, en adoptant une organisation structurée, une communication claire et des standards élevés. Cette exigence renforce la crédibilité et le rayonnement de HEC Entrepreneurs tout en valorisant l’image de l’IHEC Carthage."
    },
    {
        id: "collaboration",
        label: "Collaboration & Partage",
        icon: Users,
        color: "text-secondary",
        desc: "L’intelligence collective est au cœur du club : esprit d’équipe, entraide, écoute et respect mutuel permettent de co-créer des projets à forte valeur. Le partage des idées, des connaissances et des expériences favorise l’apprentissage, l’innovation et la réussite collective, tout en instaurant un climat inclusif et coopératif."
    },
];

interface TeamMember {
    name: string;
    role: string;
    image?: string | null;
}

const bureauExecutif: TeamMember[] = [
    { name: "Youssef Drira", role: "Président", image: "/team/youssef.JPG" },
    { name: "Yassmin Zghal", role: "Secrétaire Générale", image: "/team/yassmin.jpg" },
    { name: "Melek Kammoun", role: "Trésorier", image: "/team/melek.jpg" },
    { name: "Nourhene Ben Amor", role: "Vice-Présidente chargée des Adhérents", image: "/team/nourhene.jpg" },
    { name: "Noura Derbel", role: "Vice-Présidente chargée des Relations Extérieures", image: "/team/noura.jpg" },
    { name: "Ines Trabelsi", role: "Vice-Présidente chargée de la Communication", image: "/team/ines.jpg" },
];

const responsables: TeamMember[] = [
    { name: "Edam Guermazi", role: "Responsable Événements & Projets", image: null },
    { name: "Rihem Abbessi", role: "Responsable Développement & Innovation", image: null },
    { name: "Mohamed Hammemi", role: "Trésorier Adjoint", image: null },
    { name: "Khadija Houidi", role: "Responsable Intégration & Expérience Membre", image: null },
    { name: "Achref Jenni", role: "Responsable Protocole Interne", image: null },
    { name: "Adem Awedi", role: "Responsable Sponsoring", image: null },
    { name: "Tesnim Mehdi", role: "Responsable Protocole Externe", image: null },
    { name: "Omar Boudaya", role: "Responsable IT & Développement Web", image: "/team/omar.jpg" },
    { name: "Eya Cherif", role: "Responsable Planification & Diffusion", image: "/team/eya.jpg" },
    { name: "Maryem Khelifi", role: "Responsable Création de Contenu", image: null },
];

const membres: string[] = [
    "Adem Kammoun",
    "Ahmed Lachiheb",
    "Anis Ayedi",
    "Asma Hamda",
    "Dhia Ourir",
    "Eya Ferjani",
    "Faten Kalia",
    "Ghadine Swalhia",
    "Ibtihel Haddaoui",
    "Jamila Msallem",
    "Jassim Abrougui",
    "Laameri Touka",
    "Mariem Chaouachi",
    "Mariem Khamassi",
    "Ons Cherni",
    "Tasnim Daadoucha",
    "Ziada Moslem",
];

const teamMemberBios: Record<string, TeamMemberBio> = {
    "Youssef Drira": {
        name: "Youssef Drira",
        role: "Président (Mandat 2026-2027)",
        image: "/team/youssef.JPG",
        stories: [
            {
                title: "Excellence Académique",
                subtitle: "Diplôme & Master",
                tagline: "Un parcours ancré dans la gestion d'entreprise et le management stratégique",
                badge: "Master 2 Entrepreneuriat",
                highlights: [
                    "Diplômé d’une Licence en Sciences de Gestion, spécialité Management",
                    "En 2ᵉ année de Master Professionnel en Entrepreneuriat"
                ]
            },
            {
                title: "Transmission & Pédagogie",
                subtitle: "Formateur Homologué",
                tagline: "Impulser l'esprit d'initiative et développer le potentiel des membres",
                badge: "Youth CLUBs",
                bigStat: { number: "800+", label: "Heures de formation dispensées avec succès" },
                highlights: [
                    "Formateur homologué par l’Association Youth CLUBs",
                    "Plus de 800 heures d'ateliers dispensées en leadership et management"
                ]
            },
            {
                title: "Vision Entrepreneuriale",
                subtitle: "Incubation & Conseil",
                tagline: "De l'idée à la création de valeur concrète et mesurable",
                badge: "Pôle Sfax 2024",
                highlights: [
                    "Étudiant-entrepreneur au Pôle de l’Étudiant Entrepreneur de Sfax (2024)",
                    "Freelance spécialisé en conseil, management stratégique et gestion de projets"
                ]
            }
        ]
    },
    "Omar Boudaya": {
        name: "Omar Boudaya",
        role: "Responsable IT & Développement Web",
        image: "/team/omar.jpg",
        stories: [
            {
                title: "Expertise Tech & IA",
                subtitle: "Web Dev & IA Automation",
                tagline: "Développer les plateformes numériques et automatiser les processus intelligents",
                badge: "Freelance Web & IA",
                bigStat: { number: "5 ans", label: "D'expérience et stage au cabinet Rayon Consult" },
                highlights: [
                    "Freelance en Développement Web et Automatisations d'Intelligence Artificielle",
                    "5 ans de stage pratique au sein du cabinet de conseil Rayon Consult"
                ]
            },
            {
                title: "Leadership Associatif",
                subtitle: "Présidence & Trésorerie",
                tagline: "Une expérience solide en gestion d'équipes et gouvernance financière",
                badge: "Ex-Président LPM8",
                highlights: [
                    "Président du LPM8 Youth Club (Mandat 2022/2023)",
                    "Trésorier de Health Keepers (Mandat 2022/2023)",
                    "Membre du Conseil de Supervision du LPM8 Youth Club (Mandat 2023/2024)"
                ]
            },
            {
                title: "Gouvernance & Juridique",
                subtitle: "Conseil & Supervision",
                tagline: "Régularité statutaire et animation des instances décisionnelles",
                badge: "Conseil Juridique",
                bigStat: { number: "90+", label: "Assemblées locales supervisées" },
                highlights: [
                    "Conseil juridique local avec participation active à plus de 90 assemblées locales",
                    "Garant de la conformité réglementaire et de l'organisation des débats"
                ]
            }
        ]
    },
    "Achref Jenni": {
        name: "Achref Jenni",
        role: "Responsable Protocole Interne",
        image: null,
        stories: [
            {
                title: "Engagement Associatif",
                subtitle: "Lions Club International",
                tagline: "Une implication humaine au service du développement collectif",
                badge: "Lions Club",
                highlights: [
                    "Membre du Lions Club IHEC Carthage (Oct. 2024 – Fév. 2026) au département RH",
                    "Membre actif du Lions Club Tunis ISG depuis Février 2025"
                ]
            },
            {
                title: "Responsable RH & Médias",
                subtitle: "IHEC News",
                tagline: "Gestion des talents et structuration des équipes de communication",
                badge: "Ex-Responsable RH",
                highlights: [
                    "Responsable des Ressources Humaines au sein d’IHEC News (Sept. 2025 – Déc. 2025)",
                    "Implication dans les départements RH et Communication d'IHEC News"
                ]
            },
            {
                title: "Chef de Projet & Protocole",
                subtitle: "HEC Entrepreneurs",
                tagline: "Conduite d'initiatives à fort impact citoyen et protocole d'excellence",
                badge: "Chef de Projet",
                highlights: [
                    "Membre de HEC Entrepreneurs depuis Février 2025",
                    "Chef de Projet de l'initiative éco-citoyenne 'Carthage Tnadhef'",
                    "Responsable Protocole Interne pour le Mandat 2026/2027"
                ]
            }
        ]
    },
    "Noura Derbel": {
        name: "Noura Derbel",
        role: "Vice-Présidente chargée des Relations Extérieures",
        image: "/team/noura.jpg",
        stories: [
            {
                title: "Relations Extérieures",
                subtitle: "HEC Entrepreneurs",
                tagline: "Rayonnement institutionnel, partenariats stratégiques et suivi administratif",
                badge: "Vice-Présidente",
                highlights: [
                    "Vice-Présidente chargée des Relations Extérieures chez HEC Entrepreneurs",
                    "Coordination des activités, organisation des événements majeurs & suivi administratif"
                ]
            },
            {
                title: "Fondation & Gestion Financière",
                subtitle: "Sustainfinity Club",
                tagline: "Co-création d'un club dédié à la durabilité et à la finance responsable",
                badge: "Membre Fondateur",
                highlights: [
                    "Membre du bureau fondateur du Sustainfinity Club",
                    "Trésorière générale responsable de la gestion financière et de l'organisation interne"
                ]
            },
            {
                title: "Parcours Associatif & Impact",
                subtitle: "Enactus ESCS",
                tagline: "Un engagement continu dès les premières années universitaires",
                badge: "Enactus Alumni",
                highlights: [
                    "Membre engagée d'Enactus à l'ESCS (Mandat 2022-2023) avec participation aux projets associatifs",
                    "Développement continu des compétences universitaires et d'analyse stratégique"
                ]
            }
        ]
    }
};

const getMemberBio = (member: TeamMember): TeamMemberBio => {
    if (teamMemberBios[member.name]) {
        return teamMemberBios[member.name];
    }
    return {
        name: member.name,
        role: member.role,
        image: member.image,
        stories: [
            {
                title: "Engagement Associatif",
                subtitle: "Mandat 2026 - 2027",
                tagline: "Acteur engagé du Club HEC Entrepreneurs",
                badge: "Équipe 26/27",
                highlights: [
                    `Poste : ${member.role}`,
                    "Développement et promotion de la culture entrepreneuriale à l'IHEC Carthage",
                    "Organisation d'événements majeurs et accompagnement des nouveaux adhérents"
                ]
            }
        ]
    };
};

export default function About() {
    const [expandedValue, setExpandedValue] = useState<string | null>(null);
    const [selectedStoryMember, setSelectedStoryMember] = useState<TeamMemberBio | null>(null);

    return (
        <main className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
            <Navbar />

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
            </div>

            <div className="container mx-auto px-4 pt-40 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-24">
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-3xl sm:text-5xl md:text-7xl font-thin mb-8 text-wave uppercase tracking-[0.1em] sm:tracking-[0.2em]"
                        >
                            QUI SOMMES-NOUS
                        </motion.h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mb-32">
                        {/* Vision Column */}
                        <div className="flex flex-col gap-12">
                            {/* Vision */}
                            <motion.div
                                initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                                className="glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-secondary/20 relative group overflow-hidden flex-1"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity hidden sm:block">
                                    <Lightbulb className="w-24 h-24 text-secondary" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-light mb-6 text-secondary flex items-center gap-3 italic uppercase tracking-[0.1em]">
                                    NOTRE VISION
                                </h2>
                                <p className="text-lg sm:text-xl text-gray-300 italic leading-relaxed relative z-10 font-light">
                                    &quot;Faire du Club HEC Entrepreneurs un <span className="text-secondary font-black">pilier</span> de la culture entrepreneuriale à l’<span className="text-primary font-black">IHEC Carthage</span>. Un espace où les idées se transforment en <span className="text-secondary font-black">projets</span>, où les talents s’engagent, et où l’entrepreneuriat devient un levier de <span className="text-primary font-black">création de valeur</span>.&quot;
                                </p>
                            </motion.div>
                        </div>

                        {/* Mission Column */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-primary/20 flex flex-col justify-center relative group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity hidden sm:block">
                                <Rocket className="w-32 h-32 text-primary" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-light mb-8 text-primary flex items-center gap-3 italic uppercase tracking-[0.1em]">
                                NOTRE MISSION
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light">
                                <span className="text-primary font-bold uppercase tracking-widest text-sm block mb-4">Inspirer • Accompagner • Former</span>
                                Nous aidons les étudiants de l’IHEC Carthage à explorer l’entrepreneuriat par l’<span className="text-secondary font-bold">action</span>, développer leurs compétences clés et transformer leurs idées en projets <span className="text-accent font-bold">concrets</span>, <span className="text-accent font-bold">responsables</span> et à <span className="text-accent font-bold">impact</span>.
                            </p>
                        </motion.div>
                    </div>

                    {/* Interactive Values Accordion */}
                    <div className="mb-32">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-light text-center mb-16 text-glow uppercase tracking-[0.15em] italic">NOS VALEURS</h2>
                        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                            {values.map((val, idx) => {
                                const isExpanded = expandedValue === val.id;
                                return (
                                    <motion.div
                                        key={idx}
                                        layout
                                        onClick={() => setExpandedValue(isExpanded ? null : val.id)}
                                        className="glass rounded-2xl border border-white/5 overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
                                    >
                                        <div className="p-6 flex flex-col items-center justify-center gap-4 text-center">
                                            <div className={`p-4 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${val.color}`}>
                                                <val.icon className="w-8 h-8" />
                                            </div>
                                            <span className="font-light text-gray-200 text-lg tracking-[0.2em] uppercase">
                                                {val.label}
                                            </span>
                                            
                                            {/* Expand Icon Indicator */}
                                            <div className="mt-2 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                                                <motion.span animate={{ rotate: isExpanded ? 180 : 0 }}>
                                                    ▼
                                                </motion.span>
                                            </div>
                                        </div>
                                        
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="px-6 pb-8"
                                                >
                                                    <div className="w-full max-w-lg mx-auto h-px bg-white/10 mb-6" />
                                                    <p className="text-gray-400 text-base sm:text-lg leading-relaxed font-light text-center max-w-3xl mx-auto">
                                                        {val.desc}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="mb-32">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin text-wave uppercase tracking-[0.1em] italic mb-4">NOTRE ÉQUIPE</h2>
                            <p className="text-gray-500 font-mono tracking-[0.3em] uppercase text-xs">Mandat 2026 - 2027</p>
                        </div>

                        {/* Bureau Exécutif */}
                        <div className="mb-20">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-primary/40 flex-1" />
                                <h3 className="text-xl sm:text-2xl font-light text-primary uppercase tracking-[0.2em] italic text-center px-4">
                                    Bureau Exécutif 2026 / 2027
                                </h3>
                                <div className="h-px bg-gradient-to-l from-transparent via-primary/40 to-primary/40 flex-1" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bureauExecutif.map((member, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setSelectedStoryMember(getMemberBio(member))}
                                        className="glass p-8 rounded-[2rem] border border-white/5 hover:border-primary/40 hover:bg-white/10 transition-all text-center group cursor-pointer relative overflow-hidden shadow-lg hover:shadow-primary/20"
                                    >
                                        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-6 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform overflow-hidden shadow-xl shadow-primary/10">
                                            {member.image ? (
                                                <img
                                                    src={member.image}
                                                    alt={member.name}
                                                    className={clsx(
                                                        "w-full h-full object-cover transition-transform duration-500",
                                                        member.name === "Omar Boudaya" && "scale-[1.4] object-center"
                                                    )}
                                                />
                                            ) : (
                                                <Crown className="w-10 h-10 text-primary/70" />
                                            )}
                                        </div>
                                        <h4 className="text-lg font-light text-white uppercase tracking-[0.05em] mb-2 italic">{member.name}</h4>
                                        <p className="text-primary text-[11px] font-medium uppercase tracking-[0.15em] leading-tight opacity-90 mb-4">
                                            {member.role}
                                        </p>
                                        <div className="pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-primary/70 font-semibold uppercase tracking-wider group-hover:text-primary transition-colors">
                                            <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
                                            <span>Découvrir le parcours</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Les Responsables */}
                        <div className="mb-20">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-px bg-gradient-to-r from-transparent via-secondary/40 to-secondary/40 flex-1" />
                                <h3 className="text-xl sm:text-2xl font-light text-secondary uppercase tracking-[0.2em] italic text-center px-4">
                                    Les Responsables
                                </h3>
                                <div className="h-px bg-gradient-to-l from-transparent via-secondary/40 to-secondary/40 flex-1" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {responsables.map((member, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.04 }}
                                        onClick={() => setSelectedStoryMember(getMemberBio(member))}
                                        className="glass p-6 rounded-[2rem] border border-white/5 hover:border-secondary/40 hover:bg-white/10 transition-all text-center group flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-secondary/20"
                                    >
                                        <div>
                                            <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-primary/10 rounded-full mx-auto mb-5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform overflow-hidden shadow-lg shadow-secondary/10">
                                                {member.image ? (
                                                    <img
                                                        src={member.image}
                                                        alt={member.name}
                                                        className={clsx(
                                                            "w-full h-full object-cover transition-transform duration-500",
                                                            member.name === "Omar Boudaya" && "scale-[1.4] object-center"
                                                        )}
                                                    />
                                                ) : (
                                                    <Shield className="w-8 h-8 text-secondary/70" />
                                                )}
                                            </div>
                                            <h4 className="text-base font-light text-white uppercase tracking-[0.05em] mb-2 italic">{member.name}</h4>
                                        </div>
                                        <div>
                                            <p className="text-secondary text-[10px] font-medium uppercase tracking-[0.15em] leading-tight opacity-80 mt-2 mb-3">
                                                {member.role}
                                            </p>
                                            <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-1 text-[9px] text-secondary/70 font-semibold uppercase tracking-wider group-hover:text-secondary transition-colors">
                                                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                                                <span>Découvrir le parcours</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Les Membres */}
                        <div>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-white/20 flex-1" />
                                <h3 className="text-xl sm:text-2xl font-light text-gray-300 uppercase tracking-[0.2em] italic text-center px-4">
                                    Les Membres
                                </h3>
                                <div className="h-px bg-gradient-to-l from-transparent via-white/20 to-white/20 flex-1" />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {membres.map((name, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 15 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.03 }}
                                        onClick={() => setSelectedStoryMember(getMemberBio({ name, role: "Membre du Club", image: null }))}
                                        className="glass p-4 rounded-2xl border border-white/5 hover:border-primary/40 hover:bg-white/10 transition-all text-center group flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-primary/20"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-semibold text-gray-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:text-primary transition-all">
                                            {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                        </div>
                                        <span className="text-xs font-light text-gray-200 capitalize tracking-wide leading-tight">
                                            {name}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Projects Section */}
                    <div className="mb-32 mt-32">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-6xl font-thin text-wave uppercase tracking-[0.1em] italic mb-4">NOS PROJETS</h2>
                            <p className="text-gray-500 font-mono tracking-[0.3em] uppercase text-xs">Les initiatives qui font la différence</p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <Link href="/projets/tribunal" className="block group">
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.5 }}
                                    className="glass rounded-[2rem] overflow-hidden border border-white/10 group-hover:border-[#d4af37]/50 transition-colors flex flex-col md:flex-row relative bg-[#050505]/80"
                                >
                                    <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto md:h-[450px] relative z-0 bg-[#120805]">
                                        <Image 
                                            src="/affiche-tribunal.png" 
                                            alt="Affiche Tribunal de l'entrepreneuriat" 
                                            fill 
                                            className="object-contain p-4 group-hover:scale-105 group-hover:brightness-110 transition-all duration-700"
                                        />
                                    </div>

                                    <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center relative z-20">
                                        <h3 className="text-2xl md:text-4xl font-serif text-[#ece2d0] uppercase tracking-[0.1em] leading-tight mb-4 drop-shadow-md">
                                            LE GRAND TRIBUNAL DE<br/><span className="text-[#d4af37]">L&apos;ENTREPRENEURIAT</span>
                                        </h3>
                                        <p className="text-[#cbb0a5] text-sm md:text-base leading-relaxed font-light mb-8">
                                            Le procès spectaculaire qui remet en question le mythe de l'entrepreneuriat à l'IHEC Carthage. Un événement unique, récompensé "Meilleur Événement 2026".
                                        </p>
                                        <div className="inline-flex items-center gap-2 text-[#d4af37] font-serif uppercase tracking-widest text-xs group-hover:text-white transition-colors">
                                            <span>Découvrir l'événement</span>
                                            <span className="group-hover:translate-x-2 transition-transform">→</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
            <TeamStoryModal member={selectedStoryMember} onClose={() => setSelectedStoryMember(null)} />
        </main>
    );
}
