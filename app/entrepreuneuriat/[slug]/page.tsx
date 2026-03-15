"use client";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import Link from "next/link";

const articlesContent = {
    "champ-scientifique-multidisciplinaire": {
        title: "L’entrepreneuriat : un champ scientifique multidisciplinaire",
        category: "THEORIE",
        date: "15 Mars 2026",
        author: "Équipe HEC Entrepreneurs",
        readTime: "8 min",
        content: `
# L’entrepreneuriat : un champ scientifique fondamentalement multidisciplinaire

L’entrepreneuriat est souvent associé à la création d’entreprise, à l’innovation ou encore à la prise de risque. Pourtant, derrière cette apparente simplicité se cache un champ scientifique d’une grande complexité. Depuis plusieurs décennies, les chercheurs s’accordent à considérer l’entrepreneuriat non pas comme une simple branche du management, mais comme un domaine multidisciplinaire, mobilisant des apports issus de l’économie, de la psychologie, de la sociologie et des sciences de gestion.

Comprendre l’entrepreneuriat nécessite donc une approche intégrative, capable d’articuler l’individu, l’opportunité, l’organisation et l’environnement.

## 1. L’apport de l’économie : innovation, marché et opportunité

Historiquement, l’entrepreneuriat trouve ses racines dans la pensée économique. 

**Joseph Schumpeter**, dans *Théorie de l’évolution économique* (1911), définit l’entrepreneur comme un innovateur introduisant de nouvelles combinaisons productives : nouveaux produits, nouvelles méthodes de production, nouveaux marchés ou nouvelles organisations. Pour Schumpeter, l’entrepreneur est l’agent du changement économique, à l’origine de la « destruction créatrice » qui renouvelle les structures du marché.

Dans une perspective différente mais complémentaire, **Israel Kirzner**, dans *Competition and Entrepreneurship* (1973), insiste sur la découverte des opportunités. L’entrepreneur se distingue par sa vigilance (« alertness »), c’est-à-dire sa capacité à percevoir des opportunités inexploitées dans un environnement marqué par l’information imparfaite.

Plus tard, **Scott Shane et Sankaran Venkataraman** (2000) définissent l’entrepreneuriat comme l’étude des processus par lesquels les opportunités de création de biens et services futurs sont découvertes, évaluées et exploitées.

## 2. L’apport de la psychologie : motivation, cognition et comportement

L’entrepreneuriat ne peut être réduit à des mécanismes de marché. Il implique avant tout un individu. 

**David McClelland**, dans *The Achieving Society* (1961), démontre que le besoin d’accomplissement constitue un facteur déterminant dans l’engagement entrepreneurial. Les individus ayant un fort désir de réussite seraient plus enclins à entreprendre.

Les recherches en psychologie cognitive approfondissent cette analyse en étudiant :
*   La perception du risque
*   Les biais cognitifs
*   L’intuition entrepreneuriale
*   La capacité à décider dans l’incertitude

L’entrepreneur agit dans des contextes ambigus et incertains. Son comportement ne s’explique pas uniquement par des calculs rationnels, mais aussi par des représentations mentales, des croyances et des motivations personnelles.

## 3. L’apport de la sociologie : réseaux, capital social et institutions

L’acte entrepreneurial ne se déroule jamais dans le vide social. 

**Mark Granovetter** (1985) introduit la notion d’encastrement social, montrant que les actions économiques sont insérées dans des réseaux de relations. Les entrepreneurs mobilisent leur capital social pour accéder à des ressources financières, informationnelles et humaines.

Par ailleurs, les institutions (règles formelles et informelles, culture, normes sociales) influencent fortement la dynamique entrepreneuriale. Les environnements favorables à l’innovation encouragent davantage la création d’entreprises.

## 4. L’apport des sciences de gestion : processus et organisation

Les sciences de gestion analysent l’entrepreneuriat comme un processus structuré de création de valeur. 

**Peter Drucker**, dans *Innovation and Entrepreneurship* (1985), considère l’innovation comme une discipline pouvant être organisée et systématisée. L’entrepreneuriat devient alors une pratique stratégique.

Les sciences de gestion s’intéressent notamment :
*   Au business model
*   À la stratégie de croissance
*   À la structuration organisationnelle
*   À la gestion des ressources

Le management transforme l’idée en organisation durable.

## Conclusion

L’entrepreneuriat est, par essence, multidisciplinaire. Il ne se limite ni à l’économie, ni à la psychologie, ni au management, ni à la sociologie. Il se situe à leur intersection. 

Comprendre l’entrepreneuriat, c’est comprendre comment un individu, inscrit dans un contexte social donné, identifie une opportunité, mobilise des ressources et construit une organisation capable de créer de la valeur économique et sociale.

### Bibliographie selective
*   **Drucker, P. F. (1985).** *Innovation and entrepreneurship*.
*   **Granovetter, M. (1985).** *Economic action and social structure*.
*   **Kirzner, I. M. (1973).** *Competition and entrepreneurship*.
*   **Schumpeter, J. A. (1911).** *The theory of economic development*.
        `
    },
    "importance-echec": {
        title: "L'importance de l'échec dans le parcours entrepreneurial",
        category: "MINDSET",
        date: "11 Mars 2026",
        author: "Équipe HEC Entrepreneurs",
        readTime: "5 min",
        content: `
# L'échec : un tremplin déguisé

Dans le monde de l'entrepreneuriat, le mot "échec" est souvent perçu avec crainte. Pourtant, si l'on regarde les plus grandes réussites de notre époque, on s'aperçoit que presque toutes ont été précédées par des revers significatifs.

## Pourquoi l'échec est nécessaire ?

1.  **Apprentissage accéléré** : Rien n'enseigne mieux qu'une erreur commise sur le terrain.
2.  **Résilience** : Surmonter un obstacle renforce le mental de l'entrepreneur.
3.  **Pivot stratégique** : L'échec nous force à remettre en question nos hypothèses et à trouver de meilleures voies.

> "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme." — Winston Churchill

L'important n'est pas de ne jamais tomber, mais de se relever avec une vision plus claire. Au Club HEC Entrepreneurs, nous encourageons l'expérimentation, car chaque erreur est une donnée précieuse pour le futur.
        `
    },
    "valider-idee-budget-zero": {
        title: "Comment valider votre idée de startup avec un budget zéro",
        category: "METHODOLOGIE",
        date: "10 Mars 2026",
        author: "Coach Innovation",
        readTime: "7 min",
        content: `
# Valider sans se ruiner

Beaucoup d'étudiants pensent qu'il faut un capital initial énorme pour lancer une idée. C'est faux. L'approche Lean Startup nous apprend à valider nos concepts avant d'investir le moindre centime.

## Les étapes de validation

*   **Identifiez le problème** : Parlez à au moins 20 personnes qui pourraient avoir ce problème.
*   **Créez un MVP (Minimum Viable Product)** : Une simple landing page ou un questionnaire peut suffire.
*   **Mesurez l'intérêt** : Les gens sont-ils prêts à donner leur email ou à s'inscrire ?

Ne construisez pas une solution parfaite dans votre chambre. Sortez, confrontez votre idée au monde réel.
        `
    },
    "networking-moteur-projet": {
        title: "Le networking : le moteur invisible de votre projet",
        category: "RESEAU",
        date: "09 Mars 2026",
        author: "Alumni Club HEC",
        readTime: "4 min",
        content: `
# Le Réseau : Votre Actif le plus Précieux

On dit souvent que "votre réseau est votre valeur nette". Pour un entrepreneur, c'est une réalité tangible. Un bon carnet d'adresses peut ouvrir des portes fermées depuis des années.

## Comment networker efficacement ?

1.  **Donnez avant de recevoir** : Soyez utile aux autres d'abord.
2.  **Soyez authentique** : Les relations humaines se basent sur la confiance.
3.  **Fréquentez les bons lieux** : Le Club HEC est l'endroit idéal pour commencer.

N'ayez pas peur d'aborder des mentors ou des professionnels. La plupart sont ravis de partager leur expérience avec des étudiants passionnés.
        `
    }
};

export default function ArticlePage() {
    const params = useParams();
    const slug = params.slug as string;
    const article = articlesContent[slug as keyof typeof articlesContent];

    if (!article) {
        return (
            <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
                <Navbar />
                <h1 className="text-4xl font-thin mb-8">Article non trouvé</h1>
                <Link href="/entrepreuneuriat" className="text-primary hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Retour à la page Entrepreneuriat
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
            <Navbar />

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
            </div>

            <article className="container mx-auto px-4 pt-32 md:pt-44 pb-16 md:pb-24 relative z-10 max-w-4xl">
                <Link
                    href="/entrepreuneuriat#articles"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 md:mb-12 text-xs md:text-sm uppercase tracking-widest font-light"
                >
                    <ArrowLeft className="w-4 h-4" /> Retour aux articles
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20 uppercase tracking-[0.2em] mb-6 inline-block">
                        {article.category}
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-thin text-white mb-8 tracking-tight leading-tight uppercase italic text-wave">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-400 text-xs font-light uppercase tracking-widest mb-10 md:mb-12 pb-6 md:pb-8 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-primary" />
                            {article.author}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-primary" />
                            {article.date}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-primary" />
                            {article.readTime}
                        </div>
                    </div>

                    <div className="glass p-5 sm:p-8 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
                        <div className="prose prose-invert prose-headings:font-thin prose-headings:uppercase prose-headings:tracking-widest prose-h1:text-2xl md:prose-h1:text-4xl prose-h2:text-xl md:prose-h2:text-3xl prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-primary prose-blockquote:border-primary max-w-none prose-sm md:prose-base">
                            <ReactMarkdown>{article.content}</ReactMarkdown>
                        </div>
                    </div>
                </motion.div>
            </article>

            <Footer />
        </main>
    );
}
