export interface StyleOption {
  id: string;
  name: string;
  description: string;
  iconName: string;
  promptSuffix: string;
}

export const LOGO_STYLES: StyleOption[] = [
  {
    id: 'minimalist',
    name: 'Minimalist Vector',
    description: 'Clean negative space, modern geometric silhouette, Swiss typography feel',
    iconName: 'Shapes',
    promptSuffix: 'minimalist vector graphic logo, flat clean lines, master negative space design, modern corporate brand identity, uncluttered, iconic silhouette',
  },
  {
    id: '3d-glass',
    name: '3D Glossy & Glassmorphic',
    description: 'Translucent depth, frosted glass, smooth ambient lighting, tactile 3D emblem',
    iconName: 'Layers',
    promptSuffix: '3D embossed glassmorphism emblem, glossy translucent crystal materials, subtle studio caustics, soft depth of field, premium tactile modern icon',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk & Futuristic',
    description: 'High-tech glowing circuit motifs, hyper-modern tech aesthetics',
    iconName: 'Zap',
    promptSuffix: 'futuristic high-tech cybernetic logo, glowing neon cyan and violet accents, dark background, circuit grid lines, sleek sci-fi emblem',
  },
  {
    id: 'luxury-monogram',
    name: 'Luxury & Monogram Crest',
    description: 'Interlocking typography, refined serif monogram, metallic foil elegance',
    iconName: 'Crown',
    promptSuffix: 'luxury high-fashion monogram crest, interlocking bespoke letters, elegant gold foil accents, high-end editorial branding, timeless serif typography',
  },
  {
    id: 'abstract-geometry',
    name: 'Abstract Fluid Geometric',
    description: 'Flowing harmonic ribbons, dynamic sacred geometry, vivid gradients',
    iconName: 'Sparkles',
    promptSuffix: 'abstract dynamic geometric logo, flowing continuous ribbons, harmonious gradient blends, modern startup brand mark, optical balance',
  },
  {
    id: 'mascot-badge',
    name: 'Mascot & Character Emblem',
    description: 'Bold stylized animal/symbol badge, energetic silhouette, esports-grade punch',
    iconName: 'Shield',
    promptSuffix: 'stylized mascot emblem logo, bold iconic character silhouette, clean vector sticker style, dynamic energy, modern sports / studio crest',
  },
  {
    id: 'vintage-artisan',
    name: 'Vintage & Heritage Craft',
    description: 'Hand-crafted linework, stamp aesthetics, artisanal heritage seal',
    iconName: 'Feather',
    promptSuffix: 'artisan handcrafted vintage seal logo, fine engraved linework, heritage typography, rustic stamp aesthetics, authentic bespoke craftmark',
  },
];

export const INDUSTRIES = [
  'Artificial Intelligence & Tech',
  'Coffee, Bakery & Gastronomy',
  'Fashion, Luxury & Jewelry',
  'Fintech, Crypto & Web3',
  'Gaming, Esports & Entertainment',
  'Health, Wellness & Biotech',
  'Eco, Green Energy & Sustainability',
  'Creative Agency & Design Studio',
  'Real Estate & Modern Architecture',
  'Aerospace & Automotive',
  'Consulting & Professional Services',
  'Music, Audio & Media',
];

export const COLOR_PALETTES = [
  { name: 'Cyber Cyan & Electric Indigo', colors: ['#00F2FE', '#4FACFE', '#6C5CE7'] },
  { name: 'Emerald & Royal Champagne Gold', colors: ['#059669', '#10B981', '#F59E0B'] },
  { name: 'Obsidian & Rose Gold', colors: ['#18181B', '#F43F5E', '#FDA4AF'] },
  { name: 'Deep Midnight & Neon Violet', colors: ['#0F172A', '#8B5CF6', '#D946EF'] },
  { name: 'Warm Terracotta & Sun Sand', colors: ['#EA580C', '#FB923C', '#FBBF24'] },
  { name: 'Monochrome Luxe (White & Titanium)', colors: ['#FFFFFF', '#94A3B8', '#0F172A'] },
  { name: 'Aurora Sunset (Coral & Purple)', colors: ['#FF5E62', '#FF9966', '#7F00FF'] },
];

export interface MotionPreset {
  id: string;
  name: string;
  tagline: string;
  prompt: string;
  icon: string;
}

export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'particle-reveal',
    name: '3D Cinematic Particle Swarm',
    tagline: 'Dispersed glowing star-dust unites into a solid emblem with camera orbit',
    prompt: 'Cinematic 3D logo reveal: glowing luminous micro-particles and stardust swirl inwards, seamlessly assembling into the logo emblem. Smooth orbital camera motion with anamorphic light reflections, clean dramatic lighting on dark studio backdrop.',
    icon: 'Sparkles',
  },
  {
    id: 'neon-ignition',
    name: 'Electric Neon & Laser Ignition',
    tagline: 'Pulsing laser energy traces out the logo boundaries with lightning surges',
    prompt: 'High-voltage electric logo animation: intense vibrant laser beams and neon filaments swiftly trace the precise geometric outlines of the logo. A shockwave pulse illuminates the emblem with deep neon ambient glow and subtle smoke caustics.',
    icon: 'Zap',
  },
  {
    id: 'liquid-metal',
    name: 'Fluid Liquid Chrome & Morph',
    tagline: 'Viscous molten silver ripples and solidifies into the logo mark',
    prompt: 'Liquid metal motion graphics: ripples of molten reflective chrome and liquid gold flow dynamically across the screen, pooling together and defying gravity to mold into the sharp metallic logo emblem with rich studio reflections.',
    icon: 'Droplets',
  },
  {
    id: 'luxury-sweep',
    name: 'Luxury Studio Lens Sweep',
    tagline: 'Soft anamorphic light beam sweeps across beveled metallic edges',
    prompt: 'Ultra-refined luxury brand reveal: an elegant anamorphic horizontal lens flare and soft studio spotlight sweep diagonally across the logo emblem, highlighting beveled metallic edges and micro-textures with smooth slow-motion camera drift.',
    icon: 'Sun',
  },
  {
    id: 'holographic-glitch',
    name: 'Holographic Sci-Fi Projection',
    tagline: 'Futuristic digital grid beams the logo up with wireframe volumetrics',
    prompt: 'Futuristic holographic 3D projection: a laser grid scans the floor and beams up a volumetric blue and violet hologram of the logo. Subtle digital telemetry rings rotate around the emblem before settling into crisp solid form.',
    icon: 'Cpu',
  },
  {
    id: 'minimal-sting',
    name: 'Minimal Apple-Style Sting',
    tagline: 'Refined subtle dimensional zoom with graceful breathing shadows',
    prompt: 'Clean minimalist corporate motion sting: the logo emblem smoothly emerges from darkness with graceful physics, casting a soft organic drop shadow. Gentle breathing camera push-in with pure pristine lighting and crisp graphic silhouette.',
    icon: 'Compass',
  },
];
