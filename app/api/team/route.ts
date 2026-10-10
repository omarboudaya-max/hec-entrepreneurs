import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { StorySlide, TeamMemberBio } from "@/components/TeamStoryModal";

export const dynamic = "force-dynamic";

// Base curated bios for key leaders
const curatedBios: Record<string, TeamMemberBio> = {
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
        title: "Protocole & Organisation",
        subtitle: "Relations Internes",
        tagline: "Garant du respect des valeurs, de la cohésion d'équipe et des règles internes",
        badge: "Protocole Interne",
        highlights: [
          "Gestion et animation des assemblées générales et réunions internes",
          "Coordination étroite avec le bureau exécutif pour l'application des statuts"
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

function buildMemberStories(profile: any): StorySlide[] {
  // If curated baseline exists
  if (curatedBios[profile.full_name]) {
    const base = curatedBios[profile.full_name].stories;
    if (profile.career || profile.bio) {
      // Append a live update slide if member updated their profile in intranet
      const customHighlights: string[] = [];
      if (profile.bio) customHighlights.push(profile.bio);
      if (profile.career) {
        const parts = profile.career.split("\n").filter((p: string) => p.trim());
        customHighlights.push(...parts);
      }
      return [
        ...base,
        {
          title: "Parcours Récent & Vision",
          subtitle: "Mise à jour Intranet",
          tagline: profile.bio || "Parcours personnalisé actualisé sur le portail",
          badge: "Profil Actif",
          highlights: customHighlights.slice(0, 4)
        }
      ];
    }
    return base;
  }

  // Dynamic slides for members based on their intranet profile
  const slides: StorySlide[] = [];

  // Slide 1: Rôle & Statut
  slides.push({
    title: profile.poste || "Membre HEC",
    subtitle: "Mandat 2026 - 2027",
    tagline: profile.bio || "Acteur engagé du Club HEC Entrepreneurs",
    badge: profile.role === "bureau" ? "Bureau Exécutif" : profile.role === "responsable" || profile.role === "developpeur" ? "Responsable" : "Membre Actif",
    highlights: [
      `Poste officiel : ${profile.poste || "Membre du Club"}`,
      "Promotion active de l'entrepreneuriat et de l'innovation à l'IHEC Carthage",
      "Coordination et participation aux projets majeurs de l'année"
    ]
  });

  // Slide 2: Parcours Universitaire & Carrière
  if (profile.career) {
    const careerPoints = profile.career
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    slides.push({
      title: "Parcours Universitaire & Expériences",
      subtitle: "Roadmap & Vision",
      tagline: "Compétences clés, études et réalisations professionnelles",
      badge: "Roadmap",
      highlights: careerPoints.length > 0 ? careerPoints.slice(0, 4) : [profile.career]
    });
  } else {
    slides.push({
      title: "Parcours Académique",
      subtitle: "IHEC Carthage",
      tagline: "Formation d'excellence en gestion, finance et entrepreneuriat",
      badge: "Formation",
      highlights: [
        "Étudiant à l'Institut des Hautes Études Commerciales de Carthage (IHEC)",
        "Engagement associatif et développement des soft skills",
        "Participation active aux workshops et masterclasses du club"
      ]
    });
  }

  // Slide 3: Engagement & Impact
  slides.push({
    title: "Impact & Valeurs",
    subtitle: "HEC Entrepreneurs",
    tagline: "Idéaliser • Construire • Propulser",
    badge: "Valeurs 26/27",
    highlights: [
      "Engagement, esprit d'initiative, rigueur et créativité",
      "Contribution au rayonnement associatif de l'IHEC Carthage"
    ]
  });

  return slides;
}

export async function GET() {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from("club_profiles")
      .select("id, full_name, email, role, poste, avatar_url, bio, career, phone, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error querying club_profiles for team:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        bureau: [],
        responsables: [],
        membres: [],
      });
    }

    // Partition into Bureau, Responsables, Membres
    const bureau: any[] = [];
    const responsables: any[] = [];
    const membres: any[] = [];

    // Preferred ordering for Bureau
    const bureauOrder = [
      "Président",
      "Secrétaire Générale",
      "Trésorier",
      "Vice-Présidente chargée des Adhérents",
      "Vice-Présidente chargée des Relations Extérieures",
      "Vice-Présidente chargée de la Communication"
    ];

    for (const p of profiles) {
      const memberObj = {
        id: p.id,
        name: p.full_name,
        role: p.poste || (p.role === "bureau" ? "Membre du Bureau" : p.role === "responsable" ? "Responsable" : "Membre"),
        systemRole: p.role,
        image: p.avatar_url || (curatedBios[p.full_name]?.image || null),
        bio: p.bio || null,
        career: p.career || null,
        email: p.email,
        phone: p.phone,
        stories: buildMemberStories(p)
      };

      if (p.role === "bureau") {
        bureau.push(memberObj);
      } else if (p.role === "responsable" || p.role === "developpeur") {
        responsables.push(memberObj);
      } else {
        membres.push(memberObj);
      }
    }

    // Sort Bureau according to official protocol hierarchy
    bureau.sort((a, b) => {
      const idxA = bureauOrder.findIndex(title => a.role.toLowerCase().includes(title.toLowerCase()));
      const idxB = bureauOrder.findIndex(title => b.role.toLowerCase().includes(title.toLowerCase()));
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    // Sort Responsables alphabetically
    responsables.sort((a, b) => a.name.localeCompare(b.name));

    // Sort Membres alphabetically
    membres.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      bureau,
      responsables,
      membres,
      totalCount: profiles.length
    });
  } catch (err: any) {
    console.error("Team API route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
