// Short surahs commonly memorized by beginners
export interface QuranAyah {
  number: number;
  arabic: string;
  transliteration: string;
  translation: string;
}

export interface QuranSurah {
  number: number;
  name: string;
  nameArabic: string;
  ayahCount: number;
  ayahs: QuranAyah[];
}

export const quranSurahs: QuranSurah[] = [
  {
    number: 1,
    name: "Al-Fatiha",
    nameArabic: "الْفَاتِحَة",
    ayahCount: 7,
    ayahs: [
      { number: 1, arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", transliteration: "Bismillâhi r-rahmâni r-rahîm", translation: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux" },
      { number: 2, arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", transliteration: "Al-hamdu lillâhi rabbi l-'âlamîn", translation: "Louange à Allah, Seigneur de l'univers" },
      { number: 3, arabic: "الرَّحْمَٰنِ الرَّحِيمِ", transliteration: "Ar-rahmâni r-rahîm", translation: "Le Tout Miséricordieux, le Très Miséricordieux" },
      { number: 4, arabic: "مَالِكِ يَوْمِ الدِّينِ", transliteration: "Mâliki yawmi d-dîn", translation: "Maître du Jour de la rétribution" },
      { number: 5, arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", transliteration: "Iyyâka na'budu wa iyyâka nasta'în", translation: "C'est Toi [Seul] que nous adorons, et c'est Toi [Seul] dont nous implorons secours" },
      { number: 6, arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", transliteration: "Ihdinâ s-sirâta l-mustaqîm", translation: "Guide-nous dans le droit chemin" },
      { number: 7, arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", transliteration: "Sirâta l-ladhîna an'amta 'alayhim ghayri l-maghdûbi 'alayhim wa lâ d-dâllîn", translation: "Le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés" },
    ],
  },
  {
    number: 112,
    name: "Al-Ikhlas",
    nameArabic: "الْإِخْلَاص",
    ayahCount: 4,
    ayahs: [
      { number: 1, arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", transliteration: "Qul huwa llâhu ahad", translation: "Dis: «Il est Allah, Unique»" },
      { number: 2, arabic: "اللَّهُ الصَّمَدُ", transliteration: "Allâhu s-samad", translation: "Allah, Le Seul à être imploré pour ce que nous désirons" },
      { number: 3, arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", transliteration: "Lam yalid wa lam yûlad", translation: "Il n'a jamais engendré, n'a pas été engendré non plus" },
      { number: 4, arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", transliteration: "Wa lam yakun lahu kufuwan ahad", translation: "Et nul n'est égal à Lui" },
    ],
  },
  {
    number: 113,
    name: "Al-Falaq",
    nameArabic: "الْفَلَق",
    ayahCount: 5,
    ayahs: [
      { number: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", transliteration: "Qul a'ûdhu bi rabbi l-falaq", translation: "Dis: «Je cherche protection auprès du Seigneur de l'aube naissante»" },
      { number: 2, arabic: "مِن شَرِّ مَا خَلَقَ", transliteration: "Min sharri mâ khalaq", translation: "Contre le mal des choses qu'Il a créées" },
      { number: 3, arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", transliteration: "Wa min sharri ghâsiqin idhâ waqab", translation: "Contre le mal de l'obscurité quand elle s'approfondit" },
      { number: 4, arabic: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", transliteration: "Wa min sharri n-naffâthâti fî l-'uqad", translation: "Contre le mal de celles qui soufflent sur les nœuds" },
      { number: 5, arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", transliteration: "Wa min sharri hâsidin idhâ hasad", translation: "Et contre le mal de l'envieux quand il envie" },
    ],
  },
  {
    number: 114,
    name: "An-Nas",
    nameArabic: "النَّاس",
    ayahCount: 6,
    ayahs: [
      { number: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", transliteration: "Qul a'ûdhu bi rabbi n-nâs", translation: "Dis: «Je cherche protection auprès du Seigneur des hommes»" },
      { number: 2, arabic: "مَلِكِ النَّاسِ", transliteration: "Maliki n-nâs", translation: "Le Souverain des hommes" },
      { number: 3, arabic: "إِلَٰهِ النَّاسِ", transliteration: "Ilâhi n-nâs", translation: "Dieu des hommes" },
      { number: 4, arabic: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", transliteration: "Min sharri l-waswâsi l-khannâs", translation: "Contre le mal du mauvais conseiller, furtif" },
      { number: 5, arabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", transliteration: "Alladhî yuwaswisu fî sudûri n-nâs", translation: "Qui souffle le mal dans les poitrines des hommes" },
      { number: 6, arabic: "مِنَ الْجِنَّةِ وَالنَّاسِ", transliteration: "Mina l-jinnati wa n-nâs", translation: "Qu'il soit djinn ou être humain" },
    ],
  },
  {
    number: 110,
    name: "An-Nasr",
    nameArabic: "النَّصْر",
    ayahCount: 3,
    ayahs: [
      { number: 1, arabic: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ", transliteration: "Idhâ jâ'a nasru llâhi wa l-fath", translation: "Lorsque vient le secours d'Allah ainsi que la victoire" },
      { number: 2, arabic: "وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا", transliteration: "Wa ra'ayta n-nâsa yadkhulûna fî dîni llâhi afwâjâ", translation: "Et que tu vois les gens entrer en foule dans la religion d'Allah" },
      { number: 3, arabic: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا", transliteration: "Fa sabbiḥ bi hamdi rabbika wa staghfirh, innahu kâna tawwâbâ", translation: "Alors, par la louange, célèbre la gloire de ton Seigneur et implore Son pardon. Car c'est Lui le grand Accueillant au repentir" },
    ],
  },
  {
    number: 108,
    name: "Al-Kawthar",
    nameArabic: "الْكَوْثَر",
    ayahCount: 3,
    ayahs: [
      { number: 1, arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", transliteration: "Innâ a'taynâka l-kawthar", translation: "Nous t'avons certes, accordé l'Abondance" },
      { number: 2, arabic: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", transliteration: "Fa salli li rabbika wa nhar", translation: "Accomplis la Salât pour ton Seigneur et sacrifie" },
      { number: 3, arabic: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", transliteration: "Inna shâni'aka huwa l-abtar", translation: "Celui qui te hait sera, certes, sans postérité" },
    ],
  },
  {
    number: 107,
    name: "Al-Ma'un",
    nameArabic: "الْمَاعُون",
    ayahCount: 7,
    ayahs: [
      { number: 1, arabic: "أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ", transliteration: "Ara'ayta lladhî yukadhdhibu bi d-dîn", translation: "Vois-tu celui qui traite de mensonge la Rétribution?" },
      { number: 2, arabic: "فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ", transliteration: "Fa dhâlika lladhî yadu''u l-yatîm", translation: "C'est bien lui qui repousse l'orphelin" },
      { number: 3, arabic: "وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ", transliteration: "Wa lâ yahuḍḍu 'alâ ta'âmi l-miskîn", translation: "Et n'encourage point à nourrir le pauvre" },
      { number: 4, arabic: "فَوَيْلٌ لِّلْمُصَلِّينَ", transliteration: "Fa waylun li l-musallîn", translation: "Malheur donc, à ceux qui prient" },
      { number: 5, arabic: "الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ", transliteration: "Alladhîna hum 'an salâtihim sâhûn", translation: "Tout en négligeant leur Salât" },
      { number: 6, arabic: "الَّذِينَ هُمْ يُرَاءُونَ", transliteration: "Alladhîna hum yurâ'ûn", translation: "Qui sont pleins d'ostentation" },
      { number: 7, arabic: "وَيَمْنَعُونَ الْمَاعُونَ", transliteration: "Wa yamna'ûna l-mâ'ûn", translation: "Et refusent l'ustensile" },
    ],
  },
  {
    number: 111,
    name: "Al-Masad",
    nameArabic: "الْمَسَد",
    ayahCount: 5,
    ayahs: [
      { number: 1, arabic: "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ", transliteration: "Tabbat yadâ abî lahabin wa tabb", translation: "Que périssent les deux mains d'Abu-Lahab et que lui-même périsse" },
      { number: 2, arabic: "مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ", transliteration: "Mâ aghnâ 'anhu mâluhu wa mâ kasab", translation: "Sa fortune ne lui sert à rien, ni ce qu'il a acquis" },
      { number: 3, arabic: "سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ", transliteration: "Sa yaslâ nâran dhâta lahab", translation: "Il sera brûlé dans un Feu plein de flammes" },
      { number: 4, arabic: "وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ", transliteration: "Wa mra'atuhu ḥammâlata l-ḥaṭab", translation: "De même sa femme, la porteuse de bois" },
      { number: 5, arabic: "فِي جِيدِهَا حَبْلٌ مِّن مَّسَدٍ", transliteration: "Fî jîdihâ ḥablun min masad", translation: "À son cou, une corde de fibres" },
    ],
  },
];
