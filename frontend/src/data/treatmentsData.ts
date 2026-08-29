export type TreatmentCategory =
  | 'Skin Treatments'
  | 'Hair Treatments'
  | 'Laser Treatments'
  | 'Cosmetic Injectables'
  | 'Anti-Aging Treatments'
  | 'Chemical Peels'
  | 'Medi Facials'
  | 'Scar Treatments'
  | 'Mole / Wart / Skin Tag'
  | 'Nail Treatments'
  | 'Pediatric Dermatology'
  | 'STD & Intimate Skin Care';

export interface TreatmentFAQ {
  question: string;
  answer: string;
}

export interface ProcedureStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface TreatmentItem {
  name: string;
  slug: string;
  category: TreatmentCategory;
  shortDescription: string;
  heroImage: string;
  heroImageAlt: string;
  overview: string;
  symptoms: string[];
  procedure: ProcedureStep[];
  benefits: string[];
  suitability: string;
  faqs: TreatmentFAQ[];
  relatedSlugs: string[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
}

export const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  'Skin Treatments',
  'Hair Treatments',
  'Laser Treatments',
  'Cosmetic Injectables',
  'Anti-Aging Treatments',
  'Chemical Peels',
  'Medi Facials',
  'Scar Treatments',
  'Mole / Wart / Skin Tag',
  'Nail Treatments',
  'Pediatric Dermatology',
  'STD & Intimate Skin Care',
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Master raw treatment lists mapped to categories
const RAW_TREATMENT_TAXONOMY: { category: TreatmentCategory; items: { name: string; desc?: string; concerns?: string[] }[] }[] = [
  {
    category: 'Skin Treatments',
    items: [
      { name: 'Acne Treatment', desc: 'Comprehensive medical assessment and targeted clinical protocols for active acne breakouts, papules, pustules, and comedonal acne.' },
      { name: 'Hormonal Acne Treatment', desc: 'Specialized dermatological protocols designed for cyclical breakouts along the jawline, chin, and lower face.' },
      { name: 'Adult Acne Treatment', desc: 'Gentle, anti-aging compatible acne care for mature skin experiencing persistent or late-onset breakouts.' },
      { name: 'Teen Acne Treatment', desc: 'Teenage skin congestion care focused on sebum regulation, gentle exfoliation, and scar prevention.' },
      { name: 'Acne Scar Treatment', desc: 'Multi-modality scar reduction combining RF microneedling, subcision, and laser resurfacing for smoother skin texture.' },
      { name: 'Box Scar Treatment', desc: 'Targeted revision for sharp-edged depressed boxcar acne scars on cheeks and temples.' },
      { name: 'Ice Pick Scar Treatment', desc: 'Deep-reaching micro-tca cross and needle revision for narrow, deep pitted acne scars.' },
      { name: 'Rolling Scar Treatment', desc: 'Subcision and collagen induction therapy to release fibrous bands causing rolling skin depressions.' },
      { name: 'Chemical Peel for Acne', desc: 'Salicylic and glycolic medical peels to clear follicular congestion and diminish post-acne redness.' },
      { name: 'Laser Acne Treatment', desc: 'US-FDA approved laser light therapy targeting acne-causing bacteria and suppressing overactive sebaceous glands.' },
      { name: 'Melasma Treatment', desc: 'Combination medical depigmentation therapy for hormonal brown patches on cheeks, forehead, and upper lip.' },
      { name: 'Hyperpigmentation Treatment', desc: 'Clinical depigmenting solutions for dark patches, sun spots, and post-inflammatory skin discoloration.' },
      { name: 'Sun Spots Treatment', desc: 'Targeted laser toning and chemical peeling for solar lentigines and UV-damaged skin spots.' },
      { name: 'Freckles Treatment', desc: 'Gentle laser pigment reduction and sun protection guidance for genetic or sun-induced freckling.' },
      { name: 'Age Spots Treatment', desc: 'Precision pigment laser and anti-aging topical regimens for liver spots and senile lentigines.' },
      { name: 'Post Inflammatory Pigmentation (PIH)', desc: 'Accelerated skin renewal therapy to fade stubborn dark marks left behind by acne, burns, or rashes.' },
      { name: 'Uneven Skin Tone Treatment', desc: 'Comprehensive skin tone balancing protocols addressing dullness, patchy redness, and rough texture.' },
      { name: 'Skin Brightening Treatment', desc: 'Antioxidant infusion and clinical exfoliation designed to enhance natural skin luminosity and radiance.' },
      { name: 'Hydra Facial', desc: 'Medical-grade vortex cleansing, extraction, and antioxidant hydration for immediate skin refreshing.' },
      { name: 'Oxygen Facial', desc: 'Pressurized oxygen mist and nutrient serum delivery to revive tired, dull skin.' },
      { name: 'Medi Facial', desc: 'Dermatologist-formulated clinical facial tailored to individual skin barrier health and concerns.' },
      { name: 'OxyGeneo Facial', desc: '3-in-1 super facial providing exfoliation, natural skin oxygenation, and active serum infusion.' },
      { name: 'Carbon Laser Peel', desc: 'Hollywood carbon peel using Q-switched laser for instant oil control, pore tightening, and glow.' },
      { name: 'Glass Skin Facial', desc: 'Deep hydration and polishing protocol engineered for a smooth, poreless, reflective skin appearance.' },
      { name: 'Skin Polishing', desc: 'Clinical microdermabrasion and enzyme smoothing to remove dead stratum corneum cells.' },
      { name: 'Skin Tightening', desc: 'Radiofrequency and ultrasound non-invasive therapies to stimulate dermal collagen and firm lax skin.' },
      { name: 'Anti-Aging Treatment', desc: 'Holistic clinical anti-aging strategies targeting fine lines, loss of elasticity, and cellular repair.' },
      { name: 'Collagen Boosting Treatment', desc: 'Collagen induction procedures stimulating natural dermal fibroblasts for firmer skin texture.' },
      { name: 'Eczema', desc: 'Medical barrier-repair management for dry, itchy, inflamed atopic dermatitis patches.' },
      { name: 'Psoriasis', desc: 'Evidence-based topical, systemic, and phototherapy guidance for scaly, plaque psoriasis.' },
      { name: 'Vitiligo', desc: 'Dermatological repigmentation regimens, topical immunomodulators, and phototherapy options.' },
      { name: 'Rosacea', desc: 'Vascular laser and anti-inflammatory care for facial flushing, erythema, and visible capillaries.' },
      { name: 'Fungal Infection', desc: 'Targeted anti-fungal diagnostics and clinical treatments for tinea ringworm, candidiasis, and pityriasis.' },
      { name: 'Urticaria', desc: 'Allergy evaluation and antihistamine control strategies for chronic acute hives and itchy wheals.' },
      { name: 'Skin Allergy', desc: 'Comprehensive patch testing guidance and calming treatments for contact and systemic skin allergic reactions.' },
      { name: 'Contact Dermatitis', desc: 'Irritant and allergen identification along with barrier restoration therapies.' },
      { name: 'Seborrheic Dermatitis', desc: 'Scalp and facial yeast regulation for greasy, scaly, reddened skin patches.' },
      { name: 'Bacterial Skin Infection', desc: 'Prescription antimicrobial care for impetigo, folliculitis, boils, and superficial cellulitis.' }
    ]
  },
  {
    category: 'Hair Treatments',
    items: [
      { name: 'Hair Fall Treatment', desc: 'Diagnostic evaluation of hair root health, nutritional factors, and scalp revitalization therapies.' },
      { name: 'Female Hair Loss Treatment', desc: 'Specialized care for diffuse thinning, widening parting, and hormonal female pattern hair loss.' },
      { name: 'Male Pattern Baldness', desc: 'Androgenetic alopecia management combining DHT-blocking therapy, root stimulation, and PRP.' },
      { name: 'Alopecia Treatment', desc: 'Comprehensive clinical evaluation and treatment plans for various types of hair shedding.' },
      { name: 'Alopecia Areata', desc: 'Intralesional immunotherapy and anti-inflammatory micro-injections for patchy autoimmune hair loss.' },
      { name: 'Diffuse Hair Loss', desc: 'Telogen effluvium identification and hair cycle stabilization therapies.' },
      { name: 'PRP Hair Treatment', desc: 'Platelet-Rich Plasma micro-injections containing concentrated growth factors to reactivate dormant hair follicles.' },
      { name: 'QR678 Hair Therapy', desc: 'Biomimetic growth factor peptide administration for scalp cell nutrition and hair density.' },
      { name: 'GFC Hair Treatment', desc: 'Growth Factor Concentrate therapy delivering high concentrations of autologous growth factors to hair roots.' },
      { name: 'Mesotherapy for Hair', desc: 'Micro-injections of essential vitamins, minerals, and amino acids directly into the dermal scalp layer.' },
      { name: 'Hair Growth Factor Therapy', desc: 'Follicular cellular nutrition and bio-stimulation for weakened hair shafts.' },
      { name: 'Dandruff Treatment', desc: 'Medical anti-fungal scalp washes, anti-inflammatory lotions, and scalp barrier stabilization.' },
      { name: 'Scalp Psoriasis', desc: 'Keratolytic scale removal and targeted topical treatments for persistent scalp plaques.' },
      { name: 'Itchy Scalp', desc: 'Clinical diagnosis and relief for scalp pruritus, dryness, and folliculitis irritation.' },
      { name: 'Seborrheic Scalp', desc: 'Sebum-regulating scalp solutions to clear oily scales and redness.' },
      { name: 'Oily Scalp Treatment', desc: 'Deep scalp clarifying protocols to balance excessive oil production and prevent follicular clogging.' }
    ]
  },
  {
    category: 'Laser Treatments',
    items: [
      { name: 'Laser Hair Reduction', desc: 'US-FDA approved triple-wavelength laser technology for long-term reduction of unwanted hair on face and body.' },
      { name: 'Full Body Laser Hair Removal', desc: 'Comprehensive, comfortable full-body smooth skin laser packages calibrated for Indian skin tones.' },
      { name: 'Face Laser Hair Removal', desc: 'Precision laser treatment for upper lip, chin, jawline, and sideburn hair reduction.' },
      { name: 'Bikini Laser Hair Removal', desc: 'Gentle, hygienic, and safe intimate area laser hair removal.' },
      { name: 'Underarm Laser', desc: 'Targeted laser treatment for smooth underarms and reduction of dark shadow and ingrown hairs.' },
      { name: 'Laser Pigmentation Removal', desc: 'Q-switched Nd:YAG laser toning to fragment epidermal and dermal melanin spots.' },
      { name: 'Laser Tattoo Removal', desc: 'High-peak-power multi-wavelength laser tattoo ink breakdown with minimal surrounding tissue impact.' },
      { name: 'Carbon Laser Peel', desc: 'Non-ablative Q-switched carbon laser facial for pore tightening, oil control, and skin glow.' },
      { name: 'Laser Skin Rejuvenation', desc: 'Gentle collagen-stimulating laser toning to improve skin texture and elasticity.' },
      { name: 'Laser Scar Treatment', desc: 'Fractional laser resurfacing to smooth acne scars, surgical scars, and uneven skin contour.' }
    ]
  },
  {
    category: 'Cosmetic Injectables',
    items: [
      { name: 'Botox', desc: 'US-FDA approved botulinum toxin injections to temporarily relax hyperactive facial muscles and smooth dynamic wrinkles.' },
      { name: 'Forehead Botox', desc: 'Softens horizontal worry lines across the upper forehead for a refreshed appearance.' },
      { name: 'Crow\'s Feet Botox', desc: 'Reduces fine laugh lines and crinkling around the outer corners of the eyes.' },
      { name: 'Bunny Lines Botox', desc: 'Relaxes small diagonal wrinkles that form on the sides of the nose during smiling.' },
      { name: 'Gummy Smile Botox', desc: 'Precise muscle relaxation to prevent excessive upper gum exposure when smiling.' },
      { name: 'Lip Flip', desc: 'Subtle botox relaxation of the orbicularis oris muscle to gently roll the upper lip outward.' },
      { name: 'Lip Fillers', desc: 'Hyaluronic acid gel injections for natural lip volume enhancement, hydration, and lip border definition.' },
      { name: 'Cheek Fillers', desc: 'Mid-face volume restoration and cheekbone sculpting for youthful facial support.' },
      { name: 'Chin Fillers', desc: 'Chin projection and jawline lengthening to improve facial profile harmony.' },
      { name: 'Jawline Fillers', desc: 'Structured dermal filler contouring along the mandible for a sharp, defined jawline.' },
      { name: 'Under Eye Fillers', desc: 'Tear trough hyaluronic acid filling to diminish under-eye hollows and tiredness shadows.' },
      { name: 'Nasolabial Fold Fillers', desc: 'Soften deep laugh lines running from the corners of the nose to the mouth.' },
      { name: 'Thread Lift', desc: 'Absorbable PDO/PLLA thread insertion for immediate mechanical lift and progressive collagen stimulation.' }
    ]
  },
  {
    category: 'Anti-Aging Treatments',
    items: [
      { name: 'Wrinkle Treatment', desc: 'Comprehensive clinical evaluation targeting dynamic and static facial wrinkles.' },
      { name: 'Fine Line Treatment', desc: 'Early aging line smoothing on forehead, around eyes, and neck using hydrating micro-injections and laser.' },
      { name: 'Skin Tightening', desc: 'Non-invasive radiofrequency and ultrasound energy delivering warmth into deep dermal layers to contract collagen.' },
      { name: 'Collagen Induction Therapy', desc: 'Controlled mechanical micro-needling to trigger natural wound healing and structural collagen formation.' },
      { name: 'Microneedling', desc: 'Automated micro-punctures combined with hydrating serums to refine skin texture and pore size.' },
      { name: 'Dermapen Treatment', desc: 'Medical Dermapen 4 micro-needling for targeted scar repair, stretch marks, and skin rejuvenation.' },
      { name: 'RF Microneedling', desc: 'Radiofrequency energy delivered via insulated micro-needles into deep dermis for advanced tightening.' }
    ]
  },
  {
    category: 'Chemical Peels',
    items: [
      { name: 'Acne Peel', desc: 'Salicylic acid chemical exfoliation to dissolve follicular plugs and calm active acne lesions.' },
      { name: 'Pigmentation Peel', desc: 'Lactic, glycolic, and kojic acid formulation designed to fade hyperpigmentation and sun damage.' },
      { name: 'Glow Peel', desc: 'Gentle fruit acid peel for instant skin radiance before special events.' },
      { name: 'Anti-Aging Peel', desc: 'Multiacid peel formulated to accelerate epidermal turnover and smooth superficial fine lines.' },
      { name: 'Salicylic Peel', desc: 'Beta-hydroxy acid (BHA) peel ideal for oily, acne-prone, and congested skin.' },
      { name: 'Glycolic Peel', desc: 'Alpha-hydroxy acid (AHA) peel penetrating deeply to exfoliate dead skin cells and refine texture.' },
      { name: 'TCA Peel', desc: 'Medium-depth trichloroacetic acid peel for deeper acne scar revision and sun damage repair.' },
      { name: 'Yellow Peel', desc: 'Retinol and vitamin C enriched depigmenting peel for melasma and uneven complexion.' },
      { name: 'Pumpkin Peel', desc: 'Nutrient-rich enzymatic peel combining pumpkin enzymes and AHA for skin smoothing.' },
      { name: 'Cosmelan Peel', desc: 'World-renowned medical depigmentation mask system targeting severe melasma and recalcitrant dark patches.' }
    ]
  },
  {
    category: 'Medi Facials',
    items: [
      { name: 'HydraFacial', desc: 'Patented 4-step vortex technology to cleanse, exfoliate, extract, and hydrate skin.' },
      { name: 'Oxygeneo MediFacial', desc: 'Advanced 3-in-1 facial combining exfoliation, cellular oxygenation, and nutrient serum infusion.' },
      { name: 'Brightening MediFacial', desc: 'Vitamin C, glutathione, and botanical brightening agents for immediate radiance.' },
      { name: 'Acne MediFacial', desc: 'Clinical facial focusing on painless extractions, blue LED light therapy, and soothing antibacterial masks.' },
      { name: 'Anti-Aging MediFacial', desc: 'Peptide complexes and hyaluronic acid infusion for mature, dehydrated skin.' },
      { name: 'Collagen MediFacial', desc: 'Intense moisture replenishment facial designed to support dermal collagen elasticity.' },
      { name: 'Derma Bright MediFacial', desc: 'Customized clinical facial targeting uneven skin tone and localized dark spots.' },
      { name: 'Barrier Repair MediFacial', desc: 'Calming, lipid-replenishing facial for dry, sensitive, or compromised skin barriers.' },
      { name: 'Fire & Ice MediFacial', desc: 'Legendary resurfacing glycolic thermal mask followed by a soothing cooling peppermint hyaluronic mask.' },
      { name: 'Glass Glow MediFacial', desc: 'Skin polishing and intense serum locking for a poreless, reflective skin glow.' },
      { name: 'Radiance Reliance MediFacial', desc: 'Reverses pollution and environmental stressors to restore natural skin vitality.' },
      { name: 'Korean Glass MediFacial', desc: 'K-Beauty inspired clinical hydration protocol for luminous, dewy skin.' },
      { name: 'K-Silk MediFacial', desc: 'Silk protein and enzymatic polishing for ultra-soft, silky skin texture.' },
      { name: 'Exosome Facial', desc: 'Cutting-edge cell-free exosome nanoparticle facial for advanced skin regeneration.' },
      { name: '10-Step European MediFacial', desc: 'Comprehensive relaxation facial including deep cleansing, extractions, massage, and custom mask.' }
    ]
  },
  {
    category: 'Scar Treatments',
    items: [
      { name: 'Acne Scar Treatment', desc: 'Individualized scar planning utilizing subcision, microneedling RF, and laser resurfacing.' },
      { name: 'Surgical Scar Revision', desc: 'Laser smoothing and steroid micro-injections for post-operative surgical scar lines.' },
      { name: 'Burn Scar Management', desc: 'Contracture release support, laser texture smoothing, and hydration protocols for post-burn scars.' },
      { name: 'Stretch Marks Treatment', desc: 'RF microneedling and fractional laser to stimulate collagen along striae distensae lines.' },
      { name: 'Keloid Scar Treatment', desc: 'Intralesional triamcinolone injections, cryotherapy, and laser therapy for raised keloids.' }
    ]
  },
  {
    category: 'Mole / Wart / Skin Tag',
    items: [
      { name: 'Mole Removal', desc: 'Radiofrequency micro-cautery or surgical excision for benign moles with optimal cosmetic healing.' },
      { name: 'Wart Removal', desc: 'RF ablation or cryotherapy for viral cutaneous warts on hands, feet, or body.' },
      { name: 'Skin Tag Removal', desc: 'Instant, painless RF removal of soft fibromas on neck, eyelids, and underarms.' },
      { name: 'Corn Removal', desc: 'Clinical removal of painful hyperkeratotic foot corns along with pressure offloading guidance.' },
      { name: 'Xanthelasma Removal', desc: 'Precision radiofrequency or laser removal of yellowish cholesterol deposits around eyelids.' }
    ]
  },
  {
    category: 'Nail Treatments',
    items: [
      { name: 'Fungal Nail Infection', desc: 'Medical anti-fungal lacquer prescriptions and laser therapy for stubborn onychomycosis.' },
      { name: 'Ingrown Nail Treatment', desc: 'Painless partial matricectomy and conservative nail splinting for painful ingrown toe nails.' },
      { name: 'Brittle Nails Treatment', desc: 'Nail matrix nutrition, hydration oils, and systemic supplements to stop nail splitting.' },
      { name: 'Nail Psoriasis', desc: 'Targeted topical and systemic therapies to reduce nail pitting, crumbling, and oil drop discoloration.' },
      { name: 'Nail Pigmentation', desc: 'Diagnostic evaluation of longitudinal melanonychia and dark nail streaks.' }
    ]
  },
  {
    category: 'Pediatric Dermatology',
    items: [
      { name: 'Childhood Eczema', desc: 'Gentle, steroid-sparing eczema management for infants and children with sensitive skin.' },
      { name: 'Childhood Acne', desc: 'Pre-pubertal and early adolescent acne control using mild, non-irritating topical formulations.' },
      { name: 'Birthmarks Evaluation & Removal', desc: 'Dermatological assessment and vascular/pigment laser treatment for infant birthmarks.' },
      { name: 'Molluscum Contagiosum', desc: 'Child-friendly topical application or gentle removal of viral molluscum bumps.' },
      { name: 'Warts in Children', desc: 'Painless cryotherapy or topical solutions formulated specifically for young skin.' }
    ]
  },
  {
    category: 'STD & Intimate Skin Care',
    items: [
      { name: 'Genital Warts Removal', desc: 'Discreet, compassionate RF cautery or topical treatment for HPV genital lesions.' },
      { name: 'Intimate Fungal Infection', desc: 'Targeted anti-fungal treatment for tinea cruris (jock itch) and intimate candidiasis.' },
      { name: 'Pigmentation Around Intimate Areas', desc: 'Safe, gentle chemical peels designed specifically for dark underarm and groin skin.' },
      { name: 'Excessive Sweating (Hyperhidrosis)', desc: 'Botox micro-injections in underarms or palms to stop hyperactive sweat glands for months.' },
      { name: 'Razor Bumps (Pseudofolliculitis Barbae)', desc: 'Laser hair removal and anti-inflammatory care for painful shaving bumps and ingrown hair.' }
    ]
  }
];

// Generate full TreatmentItem array
export const TREATMENTS_DATA: TreatmentItem[] = RAW_TREATMENT_TAXONOMY.flatMap((group) => {
  return group.items.map((item) => {
    const slug = slugify(item.name);
    const varanasiContext = `at Derm Elixir Clinic under Dr. Megha Singh Pundir in Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi.`;
    
    return {
      name: item.name,
      slug,
      category: group.category,
      shortDescription: `${item.desc} Available ${varanasiContext}`,
      heroImage: `/assets/treatments/${slug}.webp`,
      heroImageAlt: `${item.name} consultation and procedure by Dr. Megha Singh Pundir in Varanasi`,
      overview: `${item.name} is a specialized clinical procedure offered at Derm Elixir in Varanasi. Under the expert medical direction of Dr. Megha Singh Pundir, each treatment protocol begins with a comprehensive skin and hair health assessment to determine suitability and tailor the clinical roadmap to your specific biology.`,
      symptoms: [
        `Visible signs requiring professional dermatological evaluation`,
        `Skin or scalp concerns impacting overall comfort and confidence`,
        `Persistent symptoms unresponsive to generic over-the-counter products`,
        `Desire for evidence-based, medically safe treatment protocols`
      ],
      procedure: [
        {
          stepNumber: 1,
          title: 'Comprehensive Consultation & Mapping',
          description: 'Dr. Megha Singh Pundir performs an in-depth clinical evaluation, examining skin barrier health, medical history, and underlying root causes.'
        },
        {
          stepNumber: 2,
          title: 'Customized Treatment Roadmap',
          description: 'A bespoke procedure plan is created, combining US-FDA approved technology, clinical peels, or prescription formulations tailored to your goals.'
        },
        {
          stepNumber: 3,
          title: 'Clinical Procedure Execution',
          description: 'The treatment is administered in a sterile, modern clinical environment prioritizing maximum comfort, safety, and hygiene.'
        },
        {
          stepNumber: 4,
          title: 'Post-Care & Follow-Up Guidance',
          description: 'Detailed home-care instructions, barrier repair protocols, and scheduled follow-up visits ensure optimal, long-lasting outcomes.'
        }
      ],
      benefits: [
        `Designed to target root causes rather than temporary superficial symptoms`,
        `Personalized protocols adjusted to individual skin sensitivity and tone`,
        `Performed using US-FDA approved technologies and medical-grade products`,
        `Supervised directly by board-certified dermatologist Dr. Megha Singh Pundir`
      ],
      suitability: `Treatment selection and candidate suitability are determined strictly through professional dermatological consultation at Derm Elixir Clinic, Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi.`,
      faqs: [
        {
          question: `What should I expect during my initial ${item.name} consultation in Varanasi?`,
          answer: `During your consult, Dr. Megha Singh Pundir will evaluate your skin condition, discuss your medical history, inspect the affected area, and explain suitable treatment options tailored to your needs.`
        },
        {
          question: `Who is an ideal candidate for ${item.name}?`,
          answer: `Suitability is determined during clinical assessment. Generally, individuals experiencing persistent symptoms who desire professional medical guidance are candidate options.`
        },
        {
          question: `Is ${item.name} safe for sensitive Indian skin types?`,
          answer: `Yes. All procedures at Derm Elixir are calibrated specifically for Indian skin phototypes to minimize risks of post-inflammatory hyperpigmentation and ensure maximum safety.`
        },
        {
          question: `How can I book a consult for ${item.name} with Dr. Megha Singh Pundir?`,
          answer: `You can book an appointment online via our website, call the helpline at +91 9120010762, or send a message on WhatsApp.`
        }
      ],
      relatedSlugs: [], // Populated dynamically below
      seoTitle: `${item.name} in Varanasi | Dr. Megha Singh Pundir Dermatologist`,
      seoDescription: `Consult Dr. Megha Singh Pundir for ${item.name} in Varanasi at Derm Elixir Clinic. Personalized dermatological care, advanced laser & medical technology. Book ₹500 consult.`,
      keywords: [item.name.toLowerCase(), `${item.name.toLowerCase()} varanasi`, `best dermatologist for ${item.name.toLowerCase()} varanasi`, 'dr megha singh pundir', 'derm elixir varanasi']
    };
  });
});

// Build dynamic related slugs for each treatment (matching same category)
TREATMENTS_DATA.forEach((treatment) => {
  const sameCategorySlugs = TREATMENTS_DATA
    .filter((t) => t.category === treatment.category && t.slug !== treatment.slug)
    .map((t) => t.slug);
  
  treatment.relatedSlugs = sameCategorySlugs.slice(0, 6);
});

// Helper lookup methods
export function getTreatmentBySlug(slug: string): TreatmentItem | undefined {
  return TREATMENTS_DATA.find((t) => t.slug === slug.toLowerCase().trim());
}

export function getTreatmentsByCategory(category: TreatmentCategory | 'All'): TreatmentItem[] {
  if (category === 'All') return TREATMENTS_DATA;
  return TREATMENTS_DATA.filter((t) => t.category === category);
}

export function getRelatedTreatments(slug: string, limit: number = 4): TreatmentItem[] {
  const target = getTreatmentBySlug(slug);
  if (!target) return TREATMENTS_DATA.slice(0, limit);

  return TREATMENTS_DATA
    .filter((t) => t.category === target.category && t.slug !== target.slug)
    .slice(0, limit);
}

export function searchTreatments(query: string, category?: string): TreatmentItem[] {
  const cleanQuery = query.toLowerCase().trim();
  return TREATMENTS_DATA.filter((t) => {
    const matchesCategory = !category || category === 'All' || t.category === category;
    const matchesQuery =
      !cleanQuery ||
      t.name.toLowerCase().includes(cleanQuery) ||
      t.shortDescription.toLowerCase().includes(cleanQuery) ||
      t.category.toLowerCase().includes(cleanQuery) ||
      t.keywords.some((k) => k.includes(cleanQuery));

    return matchesCategory && matchesQuery;
  });
}

export function generateTreatmentSchemaJsonLd(treatment: TreatmentItem) {
  const baseUrl = 'https://drmeghapundir.in';
  const pageUrl = `${baseUrl}/treatments/${treatment.slug}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalClinic',
        '@id': `${baseUrl}/#clinic`,
        'name': 'Derm Elixir by Dr. Megha Singh Pundir',
        'image': 'https://drmeghapundir.in/clinic_interior.png',
        'url': baseUrl,
        'telephone': '+91-9120010762',
        'priceRange': '₹500',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Gyandeep Medicare Hospital, Samne Ghat, Lanka',
          'addressLocality': 'Varanasi',
          'addressRegion': 'Uttar Pradesh',
          'postalCode': '221010',
          'addressCountry': 'IN'
        }
      },
      {
        '@type': 'MedicalProcedure',
        '@id': `${pageUrl}/#procedure`,
        'name': treatment.name,
        'description': treatment.shortDescription,
        'procedureType': 'NonSurgicalProcedure',
        'relevantSpecialty': {
          '@type': 'MedicalSpecialty',
          'name': 'Dermatology'
        },
        'howPerformed': treatment.procedure.map((p) => p.description).join(' ')
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}/#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': baseUrl
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Treatments',
            'item': `${baseUrl}/treatments`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': treatment.category,
            'item': `${baseUrl}/treatments?category=${encodeURIComponent(treatment.category)}`
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': treatment.name,
            'item': pageUrl
          }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}/#faq`,
        'mainEntity': treatment.faqs.map((f) => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.answer
          }
        }))
      }
    ]
  };
}
