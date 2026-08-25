export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  photo?: string;
  email?: string;
  phone?: string;
  skills: string[];
  socials: {
    linkedin?: string;
    instagram?: string;
  };
}

export const teamMembers: TeamMember[] = [
  {
    id: "sahil",
    name: "Sahil Srivastava",
    role: "Founder, SEO & Web Specialist",
    bio: "Driving business growth through advanced SEO strategies and high-converting web development.",
    avatar: "SS",
    photo: "/team/sahil.jpeg",
    email: "user.kanxer@gmail.com",
    phone: "+919696262007",
    skills: [
      "Website Development",
      "Technical SEO",
      "Google Business Profile",
      "Analytics & Strategy",
    ],
    socials: {
      linkedin: "https://www.linkedin.com/in/kanxer",
      instagram: "https://www.instagram.com/__sahil.srivastava__",
    },
  },
  {
    id: "vinay",
    name: "Vinay Shukla",
    role: "Creative & Video Editor",
    bio: "Crafting engaging reels, motion graphics, and social creatives that capture attention and build brands.",
    avatar: "VS",
    photo: "/team/vinay.jpeg",
    email: "shuklavinay0169@gmail.com",
    phone: "+919670702734",
    skills: [
      "Video Editing",
      "Reels & Shorts",
      "Motion Graphics",
      "Social Creatives",
    ],
    socials: {
      instagram: "https://www.instagram.com/pt.vny",
    },
  },
  {
    id: "amitabh",
    name: "Amitabh Pandey",
    role: "Videographer & Content Producer",
    bio: "Capturing the essence of your business through professional photography and high-quality video shoots.",
    avatar: "AP",
    photo: "/team/amitabh.jpeg",
    email: "amitabhpandey602@gmail.com",
    phone: "+919696012116",
    skills: [
      "Videography",
      "Client Shoots",
      "Photography",
      "Lighting & Composition",
    ],
    socials: {
      instagram: "https://www.instagram.com/pandit_amitabh",
    },
  },
  {
    id: "sakshi",
    name: "Sakshi Mishra",
    role: "Social Media Influencer & Brand Voice",
    bio: "Giving your brand a powerful voice and authentic face through engaging reels, on-camera presence, and high-converting influencer campaigns.",
    avatar: "SM",
    photo: "/team/sakshi.jpeg",
    email: "sakshimishra.nexus@gmail.com",
    phone: "+919696262007",
    skills: [
      "Brand Voice & Face",
      "Reels & On-Camera",
      "Influencer Marketing",
      "Social Engagement",
    ],
    socials: {
      instagram: "https://www.instagram.com/sakshigkp25",
    },
  },
];

export const coreValues = [
  {
    icon: "Target",
    title: "Results First",
    description: "Every decision is driven by data and measured against your business goals. Vanity metrics don't interest us — revenue and ROI do.",
  },
  {
    icon: "Lightbulb",
    title: "Innovation Always",
    description: "We stay on top of platform changes and algorithm updates so your brand is always positioned to win.",
  },
  {
    icon: "HandshakeIcon",
    title: "Radical Transparency",
    description: "No black-box reporting. You will always know exactly where your money is going and what it's doing.",
  },
  {
    icon: "Rocket",
    title: "Speed & Agility",
    description: "We move fast. From campaign launch to creative revision to reporting — without compromising quality.",
  },
  {
    icon: "Shield",
    title: "Brand Safety",
    description: "Your brand reputation is paramount. We follow ethical practices and keep every campaign aligned with your guidelines.",
  },
  {
    icon: "HeartHandshake",
    title: "Long-term Partnership",
    description: "We don't just deliver campaigns — we invest in understanding your business deeply to become a true growth partner.",
  },
];

export const agencyTimeline = [
  { year: "2024", event: "Founded", detail: "Started as a small team helping local businesses with Meta Ads." },
  { year: "2025", event: "First Clients", detail: "Onboarded our first clients across real estate, wellness, and retail." },
  { year: "2026", event: "Expanding Services", detail: "Added SEO, websites, and automation. Now serving a growing roster of local businesses." },
];
