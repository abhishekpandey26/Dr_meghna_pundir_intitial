export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: 'General & Consultation' | 'Acne & Pigmentation' | 'Hair Loss & Scalp' | 'Aesthetic & Anti-Ageing' | 'Pricing & Appointments';
  keywords: string[];
}

export const FAQ_CATEGORIES = [
  'All',
  'General & Consultation',
  'Acne & Pigmentation',
  'Hair Loss & Scalp',
  'Aesthetic & Anti-Ageing',
  'Pricing & Appointments',
] as const;

export const FAQ_DATA: FaqItem[] = [
  {
    id: 1,
    category: 'General & Consultation',
    question: 'Who is the best dermatologist in Varanasi?',
    answer: 'Dr. Megha Singh Pundir is widely regarded as one of the best dermatologists and skin specialists in Varanasi. With extensive clinical experience in medical dermatology, laser treatments, and aesthetic skin rejuvenation at Derm Elixir (Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi), she provides personalized, evidence-based care.',
    keywords: ['best dermatologist', 'varanasi', 'skin doctor', 'dr megha singh pundir']
  },
  {
    id: 2,
    category: 'General & Consultation',
    question: 'Who is a good skin specialist in Varanasi?',
    answer: 'Dr. Megha Singh Pundir is a highly recommended skin specialist in Varanasi known for accurate diagnostics, patient-focused care, and advanced dermatological solutions for acne, pigmentation, hair loss, and anti-ageing concerns.',
    keywords: ['good skin specialist', 'varanasi', 'dermatologist']
  },
  {
    id: 3,
    category: 'General & Consultation',
    question: 'Which doctor should I consult for skin problems in Varanasi?',
    answer: 'For acute or chronic skin problems—such as acne, eczema, psoriasis, melasma, hyperpigmentation, or allergies—you should consult a board-certified dermatologist like Dr. Megha Singh Pundir at Derm Elixir, Gyandeep Medicare Hospital, Varanasi.',
    keywords: ['skin problems', 'consult doctor', 'varanasi']
  },
  {
    id: 4,
    category: 'Hair Loss & Scalp',
    question: 'Which doctor should I consult for hair fall in Varanasi?',
    answer: 'Hair fall and hair thinning require evaluation by a specialist dermatologist or trichologist. Dr. Megha Singh Pundir specializes in hair loss diagnostics, PRP therapy, GFC, and clinical hair growth regimens in Varanasi.',
    keywords: ['hair fall doctor', 'trichologist', 'varanasi']
  },
  {
    id: 5,
    category: 'General & Consultation',
    question: 'Where can I consult a dermatologist in Varanasi?',
    answer: 'You can consult Dr. Megha Singh Pundir at Derm Elixir Clinic, located inside Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi, Uttar Pradesh 221010. Appointments can be booked online or by calling +91 9120010762.',
    keywords: ['consult dermatologist', 'clinic location', 'varanasi', 'samne ghat', 'lanka']
  },
  {
    id: 6,
    category: 'General & Consultation',
    question: 'Which is a good skin clinic in Varanasi?',
    answer: 'Derm Elixir at Gyandeep Medicare Hospital (Samne Ghat, Lanka, Varanasi) is a top-rated skin, hair, and aesthetic clinic offering state-of-the-art US-FDA approved laser technologies, clinical dermato-surgeries, and customized skincare protocols under Dr. Megha Singh Pundir.',
    keywords: ['good skin clinic', 'derm elixir', 'varanasi']
  },
  {
    id: 7,
    category: 'General & Consultation',
    question: 'How do I choose the right dermatologist in Varanasi?',
    answer: 'Look for a qualified dermatologist with strong clinical credentials, positive patient reviews, modern US-FDA approved laser technology, and transparent consultation practices. Dr. Megha Singh Pundir fulfills all these standards at Derm Elixir Clinic.',
    keywords: ['choose dermatologist', 'right doctor', 'varanasi']
  },
  {
    id: 8,
    category: 'General & Consultation',
    question: 'When should I visit a dermatologist for a skin problem?',
    answer: 'You should visit a dermatologist if you experience persistent acne, sudden hair thinning, dark spots/pigmentation, unexpected skin rashes, changes in mole size/color, itchy skin, or when OTC products do not work.',
    keywords: ['when to visit dermatologist', 'skin symptoms']
  },
  {
    id: 9,
    category: 'General & Consultation',
    question: 'Can I consult Dr. Megha Singh Pundir for skin and hair problems?',
    answer: 'Yes, Dr. Megha Singh Pundir provides expert medical consultations for all skin conditions (acne, eczema, psoriasis, allergies, infections) as well as hair and scalp concerns (hair fall, thinning, dandruff, scalp psoriasis).',
    keywords: ['dr megha singh pundir', 'skin and hair consultation']
  },
  {
    id: 10,
    category: 'General & Consultation',
    question: 'What skin problems does Dr. Megha Singh Pundir treat?',
    answer: 'Dr. Megha Singh Pundir treats active acne, pimples, acne scars, melasma, hyperpigmentation, dark spots, hair loss, alopecia, eczema, psoriasis, skin allergies, fine lines, wrinkles, and provides advanced aesthetic procedures like HIFU, Botox, Fillers, and Chemical Peels.',
    keywords: ['treatments offered', 'skin problems treated', 'dr megha']
  },
  {
    id: 11,
    category: 'Acne & Pigmentation',
    question: 'Does Dr. Megha Singh Pundir treat acne and pimples?',
    answer: 'Yes, Dr. Megha Singh Pundir specializes in treating all grades of acne—including hormonal acne, cystic acne, blackheads, and whiteheads—using personalized medical prescriptions, targeted chemical peels, and laser therapy.',
    keywords: ['treat acne', 'pimples treatment', 'varanasi']
  },
  {
    id: 12,
    category: 'Acne & Pigmentation',
    question: 'Can I consult Dr. Megha Singh Pundir for acne scars?',
    answer: 'Absolutely. Dr. Megha offers comprehensive acne scar reduction therapies including Microneedling RF (MNRF), Subcision, TCA CROSS, Chemical Peels, and Fractional Laser Resurfacing to smooth out pitted and ice-pick scars.',
    keywords: ['acne scar doctor', 'scar treatment', 'mnrf', 'varanasi']
  },
  {
    id: 13,
    category: 'Acne & Pigmentation',
    question: 'Can a dermatologist treat pigmentation and dark spots?',
    answer: 'Yes, dermatologists use targeted clinical treatments such as chemical peels, Q-switched Nd:YAG laser toning, topical depigmentation agents, and medical facials to reduce melanin buildup and restore an even skin tone.',
    keywords: ['treat pigmentation', 'dark spots', 'dermatologist']
  },
  {
    id: 14,
    category: 'Acne & Pigmentation',
    question: 'Which doctor should I consult for melasma and facial pigmentation?',
    answer: 'You should consult a dermatologist like Dr. Megha Singh Pundir, who provides customized melasma treatment protocols integrating barrier-repair skincare, prescription depigmenting formulations, sun protection guidance, and gentle laser toning.',
    keywords: ['melasma doctor', 'facial pigmentation', 'varanasi']
  },
  {
    id: 15,
    category: 'Hair Loss & Scalp',
    question: 'Can I consult a dermatologist for hair fall and hair thinning?',
    answer: 'Yes, dermatologists are medical specialists trained in hair and scalp health (trichology). Dr. Megha evaluates hair root density, scalp health, and hormonal factors to prescribe effective hair regrowth treatments.',
    keywords: ['hair fall consultation', 'hair thinning doctor']
  },
  {
    id: 16,
    category: 'Hair Loss & Scalp',
    question: 'What is the best treatment for excessive hair fall?',
    answer: 'The best hair fall treatment depends on the underlying cause. Highly effective clinical treatments offered by Dr. Megha include PRP (Platelet-Rich Plasma) therapy, GFC (Growth Factor Concentrate), Mesotherapy, topical hair serums, and prescription oral supplements.',
    keywords: ['best hair fall treatment', 'prp therapy', 'gfc hair loss']
  },
  {
    id: 17,
    category: 'Hair Loss & Scalp',
    question: 'Can dermatologists treat dandruff and scalp problems?',
    answer: 'Yes, dermatologists effectively treat stubborn dandruff (seborrheic dermatitis), scalp psoriasis, fungal infections, and hair follicle inflammation using medical anti-fungal solutions, scalp peels, and targeted scalp care.',
    keywords: ['dandruff treatment', 'scalp problems', 'seborrheic dermatitis']
  },
  {
    id: 18,
    category: 'Hair Loss & Scalp',
    question: 'When should I see a doctor for hair loss?',
    answer: 'You should consult a doctor if you shed more than 100 strands per day, notice thinning around your hairline or crown, experience sudden patchy hair loss, or have scalp itching, pain, or redness.',
    keywords: ['when to see doctor hair loss', 'hair shedding']
  },
  {
    id: 19,
    category: 'Aesthetic & Anti-Ageing',
    question: 'Can I consult Dr. Megha Singh Pundir for cosmetic skin concerns?',
    answer: 'Yes, Dr. Megha Singh Pundir offers specialized aesthetic consultations for non-surgical face lifting, skin tightening, facial glow, anti-ageing, dark circles, skin tone brightening, and contour enhancement.',
    keywords: ['cosmetic skin concerns', 'aesthetic dermatologist']
  },
  {
    id: 20,
    category: 'Aesthetic & Anti-Ageing',
    question: 'Where can I get skin rejuvenation treatment in Varanasi?',
    answer: 'Skin rejuvenation treatments including Medi-Facials, Laser Carbon Peels, Hydrating Infusions, and Glow Peels are available at Derm Elixir Clinic by Dr. Megha Singh Pundir in Samne Ghat, Lanka, Varanasi.',
    keywords: ['skin rejuvenation', 'medi-facial', 'glow treatment', 'varanasi']
  },
  {
    id: 21,
    category: 'Acne & Pigmentation',
    question: 'Where can I get acne scar treatment in Varanasi?',
    answer: 'Advanced acne scar treatments—such as Microneedling RF, Subcision, Fractional Laser, and Chemical Peels—are performed at Derm Elixir Clinic, Gyandeep Medicare Hospital, Varanasi under Dr. Megha Singh Pundir.',
    keywords: ['acne scar treatment varanasi', 'mnrf scar removal']
  },
  {
    id: 22,
    category: 'Acne & Pigmentation',
    question: 'Where can I get pigmentation treatment in Varanasi?',
    answer: 'Specialized pigmentation and melasma therapies are provided at Derm Elixir Clinic, Samne Ghat, Lanka, Varanasi using advanced medical depigmentation peels and laser toning.',
    keywords: ['pigmentation treatment varanasi', 'melasma care']
  },
  {
    id: 23,
    category: 'Hair Loss & Scalp',
    question: 'Where can I get hair loss treatment in Varanasi?',
    answer: 'Clinical hair loss treatments—including PRP therapy, GFC hair regrowth, and scalp mesotherapy—are available at Derm Elixir Clinic, Samne Ghat, Lanka, Varanasi by Dr. Megha Singh Pundir.',
    keywords: ['hair loss treatment varanasi', 'prp clinic varanasi']
  },
  {
    id: 24,
    category: 'Aesthetic & Anti-Ageing',
    question: 'Where can I get anti-ageing treatment in Varanasi?',
    answer: 'Comprehensive anti-ageing services—including HIFU non-surgical face lift, Botox, Dermal Fillers, Collagen Boosters, and Fine Line Smoothing—are available at Derm Elixir Clinic, Varanasi.',
    keywords: ['anti-ageing treatment varanasi', 'botox fillers hifu']
  },
  {
    id: 25,
    category: 'Aesthetic & Anti-Ageing',
    question: 'Where can I get HIFU face lifting treatment in Varanasi?',
    answer: 'High-Intensity Focused Ultrasound (HIFU) non-surgical face lifting and jawline tightening treatment is offered at Derm Elixir Clinic, Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi.',
    keywords: ['hifu treatment varanasi', 'face lifting varanasi']
  },
  {
    id: 26,
    category: 'Aesthetic & Anti-Ageing',
    question: 'Where can I get Botox treatment in Varanasi?',
    answer: 'US-FDA approved Botox injections for forehead lines, crow’s feet, frown lines, and facial contouring are safely administered by Dr. Megha Singh Pundir at Derm Elixir Clinic, Varanasi.',
    keywords: ['botox treatment varanasi', 'botox doctor']
  },
  {
    id: 27,
    category: 'Aesthetic & Anti-Ageing',
    question: 'Where can I get dermal fillers in Varanasi?',
    answer: 'Hyaluronic acid dermal fillers for lip enhancement, cheek volume, tear trough (dark circle) correction, and smile line reduction are expertly performed by Dr. Megha Singh Pundir at Derm Elixir Clinic, Varanasi.',
    keywords: ['dermal fillers varanasi', 'lip filler', 'facial filler']
  },
  {
    id: 28,
    category: 'Aesthetic & Anti-Ageing',
    question: 'Where can I get a chemical peel in Varanasi?',
    answer: 'Customized chemical peels (Salicylic, Glycolic, Lactic, Ferulic, TCA, and Yellow Peels) for acne, glow, and pigmentation are available at Derm Elixir Clinic by Dr. Megha Singh Pundir in Varanasi.',
    keywords: ['chemical peel varanasi', 'glow peel', 'acne peel']
  },
  {
    id: 29,
    category: 'Aesthetic & Anti-Ageing',
    question: 'Where can I get a medi-facial in Varanasi?',
    answer: 'Medical-grade facials designed to deeply exfoliate, hydrate, and infuse skin with potent antioxidants are offered at Derm Elixir Clinic, Samne Ghat, Lanka, Varanasi.',
    keywords: ['medi facial varanasi', 'hydra facial', 'skin glow']
  },
  {
    id: 30,
    category: 'Aesthetic & Anti-Ageing',
    question: 'Are aesthetic skin treatments safe?',
    answer: 'Yes, when performed by a qualified dermatologist using US-FDA approved equipment and medical safety standards, aesthetic procedures like laser therapy, HIFU, Botox, and chemical peels are safe with minimal downtime.',
    keywords: ['aesthetic treatment safety', 'safe skin procedures']
  },
  {
    id: 31,
    category: 'Pricing & Appointments',
    question: 'How much does a dermatologist consultation cost in Varanasi?',
    answer: 'The initial comprehensive consultation fee with Dr. Megha Singh Pundir at Derm Elixir Clinic is ₹500. This includes skin/hair diagnostics and a customized treatment roadmap.',
    keywords: ['consultation fee varanasi', 'dermatologist cost', '500 rs']
  },
  {
    id: 32,
    category: 'Pricing & Appointments',
    question: 'How much does acne treatment cost in Varanasi?',
    answer: 'Acne treatment costs depend on the severity and required procedures. Medical consultations start at ₹500, with specialized chemical peel sessions typically starting from ₹1,500 to ₹3,000 per session.',
    keywords: ['acne treatment cost varanasi', 'acne price']
  },
  {
    id: 33,
    category: 'Pricing & Appointments',
    question: 'How much does hair loss treatment cost in Varanasi?',
    answer: 'Hair loss treatment cost depends on the recommended protocol. Clinical PRP and GFC hair restoration sessions typically range between ₹3,000 and ₹7,000 per session. Customized treatment packages are provided after consultation.',
    keywords: ['hair loss treatment cost varanasi', 'prp price varanasi']
  },
  {
    id: 34,
    category: 'Pricing & Appointments',
    question: 'How much does pigmentation treatment cost in Varanasi?',
    answer: 'Pigmentation treatment costs depend on whether chemical peels, topical therapy, or laser toning sessions are advised, with individual treatment sessions starting from ₹2,000 to ₹5,000.',
    keywords: ['pigmentation treatment cost varanasi', 'laser price']
  },
  {
    id: 35,
    category: 'Pricing & Appointments',
    question: 'How much does HIFU treatment cost in Varanasi?',
    answer: 'HIFU face lifting cost varies depending on the targeted treatment area (full face, lower face/jawline, or neck). Exact pricing is customized during your consultation with Dr. Megha Singh Pundir based on skin elasticity and treatment scope.',
    keywords: ['hifu treatment cost varanasi', 'hifu price']
  },
  {
    id: 36,
    category: 'Pricing & Appointments',
    question: 'How can I book an appointment with Dr. Megha Singh Pundir?',
    answer: 'You can book an appointment online through the Derm Elixir website booking form, via WhatsApp (+91 9120010762), or by calling the clinic helpline directly at +91 9120010762.',
    keywords: ['book appointment dr megha', 'online booking']
  },
  {
    id: 37,
    category: 'Pricing & Appointments',
    question: 'Where is Dr. Megha Singh Pundir\'s clinic in Varanasi?',
    answer: 'Dr. Megha Singh Pundir’s Derm Elixir Clinic is located inside Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi, Uttar Pradesh 221010.',
    keywords: ['clinic location', 'address dr megha', 'samne ghat lanka']
  },
  {
    id: 38,
    category: 'Pricing & Appointments',
    question: 'What are the consultation timings of Dr. Megha Singh Pundir?',
    answer: 'Regular clinic consultation hours are Monday to Saturday from 10:00 AM to 08:00 PM. Sunday consultations are available by prior appointment.',
    keywords: ['consultation timings', 'clinic hours', 'dr megha timing']
  },
  {
    id: 39,
    category: 'Pricing & Appointments',
    question: 'Does Dr. Megha Singh Pundir see new patients?',
    answer: 'Yes, Dr. Megha Singh Pundir is accepting new patients for medical dermatology, hair fall management, laser procedures, and aesthetic skin care consultations.',
    keywords: ['new patients dr megha', 'accepting new patients']
  },
  {
    id: 40,
    category: 'Pricing & Appointments',
    question: 'How can I contact Dr. Megha Singh Pundir\'s clinic?',
    answer: 'You can reach Derm Elixir Clinic by calling +91 9120010762, messaging on WhatsApp at +91 9120010762, or visiting in person at Gyandeep Medicare Hospital, Samne Ghat, Lanka, Varanasi.',
    keywords: ['contact clinic', 'phone number dr megha', 'whatsapp number']
  }
];

export function generateFaqSchemaJsonLd(faqs: FaqItem[] = FAQ_DATA) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}
