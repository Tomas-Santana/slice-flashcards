const languages = [
  { code: "ab", name: "Аҧсшәа" }, // Abkhazian
  { code: "aa", name: "Qafár af" }, // Afar
  { code: "af", name: "Afrikaans" }, // Afrikaans
  { code: "ak", name: "Akan" }, // Akan
  { code: "sq", name: "Shqip" }, // Albanian
  { code: "am", name: "አማርኛ" }, // Amharic
  { code: "ar", name: "العربية" }, // Arabic
  { code: "an", name: "Aragonés" }, // Aragonese
  { code: "hy", name: "Հայերեն" }, // Armenian
  { code: "as", name: "অসমীয়া" }, // Assamese
  { code: "av", name: "Авар мацӀ" }, // Avaric
  { code: "ae", name: "Avesta" }, // Avestan
  { code: "ay", name: "Aymar aru" }, // Aymara
  { code: "az", name: "Azərbaycan dili" }, // Azerbaijani
  { code: "bm", name: "Bamanankan" }, // Bambara
  { code: "ba", name: "Башҡорт теле" }, // Bashkir
  { code: "eu", name: "Euskara" }, // Basque
  { code: "be", name: "Беларуская" }, // Belarusian
  { code: "bn", name: "বাংলা" }, // Bengali
  { code: "bh", name: "भोजपुरी" }, // Bihari languages (Usando el de Bhojpuri como ejemplo común)
  { code: "bi", name: "Bislama" }, // Bislama
  { code: "bs", name: "Bosanski" }, // Bosnian
  { code: "br", name: "Brezhoneg" }, // Breton
  { code: "bg", name: "Български" }, // Bulgarian
  { code: "my", name: "မြန်မာစာ" }, // Burmese
  { code: "ca", name: "Català" }, // Catalan, Valencian
  { code: "km", name: "ភាសាខ្មែរ" }, // Central Khmer
  { code: "ch", name: "Chamoru" }, // Chamorro
  { code: "ce", name: "Нохчийн мотт" }, // Chechen
  { code: "ny", name: "Chichewa" }, // Chichewa, Chewa, Nyanja
  { code: "zh", name: "中文" }, // Chinese
  { code: "cu", name: "Словѣ́ньскъ ѩзы́къ" }, // Church Slavonic, Old Bulgarian, Old Church Slavonic
  { code: "cv", name: "Чăвашла" }, // Chuvash
  { code: "kw", name: "Kernewek" }, // Cornish
  { code: "co", name: "Corsu" }, // Corsican
  { code: "cr", name: "Nēhiyawēwin" }, // Cree
  { code: "hr", name: "Hrvatski" }, // Croatian
  { code: "cs", name: "Čeština" }, // Czech
  { code: "da", name: "Dansk" }, // Danish
  { code: "dv", name: "ދިވެހި" }, // Divehi, Dhivehi, Maldivian
  { code: "nl", name: "Nederlands" }, // Dutch, Flemish
  { code: "dz", name: "རྫོང་ཁ" }, // Dzongkha
  { code: "en", name: "English" }, // English (Se mantuvo "English" para la referencia)
  { code: "eo", name: "Esperanto" }, // Esperanto
  { code: "et", name: "Eesti" }, // Estonian
  { code: "ee", name: "Eʋegbe" }, // Ewe
  { code: "fo", name: "Føroyskt" }, // Faroese
  { code: "fj", name: "Vosa Vakaviti" }, // Fijian
  { code: "fi", name: "Suomi" }, // Finnish
  { code: "fr", name: "Français" }, // French
  { code: "ff", name: "Fulfulde" }, // Fulah
  { code: "gd", name: "Gàidhlig" }, // Gaelic, Scottish Gaelic
  { code: "gl", name: "Galego" }, // Galician
  { code: "lg", name: "Luganda" }, // Ganda
  { code: "ka", name: "ქართული" }, // Georgian
  { code: "de", name: "Deutsch" }, // German
  { code: "ki", name: "Gikuyu" }, // Gikuyu, Kikuyu
  { code: "el", name: "Ελληνικά" }, // Greek (Modern)
  { code: "kl", name: "Kalaallisut" }, // Greenlandic, Kalaallisut
  { code: "gn", name: "Avañe'ẽ" }, // Guarani
  { code: "gu", name: "ગુજરાતી" }, // Gujarati
  { code: "ht", name: "Kreyòl ayisyen" }, // Haitian, Haitian Creole
  { code: "ha", name: "Hausa" }, // Hausa
  { code: "he", name: "עברית" }, // Hebrew
  { code: "hz", name: "Otjiherero" }, // Herero
  { code: "hi", name: "हिन्दी" }, // Hindi
  { code: "ho", name: "Hiri Motu" }, // Hiri Motu
  { code: "hu", name: "Magyar" }, // Hungarian
  { code: "is", name: "Íslenska" }, // Icelandic
  { code: "io", name: "Ido" }, // Ido
  { code: "ig", name: "Igbo" }, // Igbo
  { code: "id", name: "Bahasa Indonesia" }, // Indonesian
  {
    code: "ia",
    name: "Interlingua",
  }, // Interlingua (International Auxiliary Language Association)
  { code: "ie", name: "Interlingue" }, // Interlingue
  { code: "iu", name: "ᐃᓄᒃᑎᑐᑦ" }, // Inuktitut
  { code: "ik", name: "Iñupiaq" }, // Inupiaq
  { code: "ga", name: "Gaeilge" }, // Irish
  { code: "it", name: "Italiano" }, // Italian
  { code: "ja", name: "日本語" }, // Japanese
  { code: "jv", name: "Basa Jawa" }, // Javanese
  { code: "kn", name: "ಕನ್ನಡ" }, // Kannada
  { code: "kr", name: "Kanuri" }, // Kanuri
  { code: "ks", name: "کٲشُر" }, // Kashmiri
  { code: "kk", name: "Қазақ тілі" }, // Kazakh
  { code: "rw", name: "Kinyarwanda" }, // Kinyarwanda
  { code: "kv", name: "Коми" }, // Komi
  { code: "kg", name: "Kikongo" }, // Kongo
  { code: "ko", name: "한국어" }, // Korean
  { code: "kj", name: "Kuanyama" }, // Kwanyama, Kuanyama
  { code: "ku", name: "Kurdî" }, // Kurdish
  { code: "ky", name: "Кыргызча" }, // Kyrgyz
  { code: "lo", name: "ພາສາລາວ" }, // Lao
  { code: "la", name: "Latine" }, // Latin
  { code: "lv", name: "Latviešu" }, // Latvian
  { code: "lb", name: "Lëtzebuergesch" }, // Letzeburgesch, Luxembourgish
  { code: "li", name: "Limburgs" }, // Limburgish, Limburgan, Limburger
  { code: "ln", name: "Lingála" }, // Lingala
  { code: "lt", name: "Lietuvių" }, // Lithuanian
  { code: "lu", name: "Kiluba" }, // Luba-Katanga
  { code: "mk", name: "Македонски" }, // Macedonian
  { code: "mg", name: "Malagasy" }, // Malagasy
  { code: "ms", name: "Bahasa Melayu" }, // Malay
  { code: "ml", name: "മലയാളം" }, // Malayalam
  { code: "mt", name: "Malti" }, // Maltese
  { code: "gv", name: "Gaelg" }, // Manx
  { code: "mi", name: "Māori" }, // Maori
  { code: "mr", name: "मराठी" }, // Marathi
  { code: "mh", name: "Kajin M̧ajeļ" }, // Marshallese
  { code: "ro", name: "Română" }, // Moldovan, Moldavian, Romanian
  { code: "mn", name: "Монгол хэл" }, // Mongolian
  { code: "na", name: "Ekaieidien" }, // Nauru
  { code: "nv", name: "Diné bizaad" }, // Navajo, Navaho
  { code: "nd", name: "isiNdebele" }, // Northern Ndebele
  { code: "ng", name: "Oshindonga" }, // Ndonga
  { code: "ne", name: "नेपाली" }, // Nepali
  { code: "se", name: "Davvisámegiella" }, // Northern Sami
  { code: "no", name: "Norsk" }, // Norwegian
  { code: "nb", name: "Norsk bokmål" }, // Norwegian Bokmål
  { code: "nn", name: "Norsk nynorsk" }, // Norwegian Nynorsk
  { code: "ii", name: "ꆈꌠ꒿ Nuosuhxop" }, // Nuosu, Sichuan Yi
  { code: "oc", name: "Occitan" }, // Occitan (post 1500)
  { code: "oj", name: "Ojibwemowin" }, // Ojibwa
  { code: "or", name: "ଓଡ଼ିଆ" }, // Oriya
  { code: "om", name: "Afaan Oromoo" }, // Oromo
  { code: "os", name: "Ирон æвзаг" }, // Ossetian, Ossetic
  { code: "pi", name: "पाळि" }, // Pali
  { code: "pa", name: "ਪੰਜਾਬੀ" }, // Panjabi, Punjabi
  { code: "ps", name: "پښتو" }, // Pashto, Pushto
  { code: "fa", name: "فارسی" }, // Persian
  { code: "pl", name: "Polski" }, // Polish
  { code: "pt", name: "Português" }, // Portuguese
  { code: "qu", name: "Runa simi" }, // Quechua
  { code: "rm", name: "Rumantsch" }, // Romansh
  { code: "rn", name: "Kirundi" }, // Rundi
  { code: "ru", name: "Русский" }, // Russian
  { code: "sm", name: "Gagana Sāmoa" }, // Samoan
  { code: "sg", name: "Sängö" }, // Sango
  { code: "sa", name: "संस्कृतम्" }, // Sanskrit
  { code: "sc", name: "Sardu" }, // Sardinian
  { code: "sr", name: "Српски" }, // Serbian
  { code: "sn", name: "chiShona" }, // Shona
  { code: "sd", name: "سنڌي" }, // Sindhi
  { code: "si", name: "සිංහල" }, // Sinhala, Sinhalese
  { code: "sk", name: "Slovenčina" }, // Slovak
  { code: "sl", name: "Slovenščina" }, // Slovenian
  { code: "so", name: "Soomaali" }, // Somali
  { code: "st", name: "Sesotho" }, // Sotho, Southern
  { code: "es", name: "Español" }, // Spanish
  { code: "su", name: "Basa Sunda" }, // Sundanese
  { code: "sw", name: "Kiswahili" }, // Swahili
  { code: "ss", name: "SiSwati" }, // Swati
  { code: "sv", name: "Svenska" }, // Swedish
  { code: "tl", name: "Tagalog" }, // Tagalog
  { code: "ty", name: "Reo Tahiti" }, // Tahitian
  { code: "tg", name: "Тоҷикӣ" }, // Tajik
  { code: "ta", name: "தமிழ்" }, // Tamil
  { code: "tt", name: "Татарча" }, // Tatar
  { code: "te", name: "తెలుగు" }, // Telugu
  { code: "th", name: "ไทย" }, // Thai
  { code: "bo", name: "བོད་སྐད་" }, // Tibetan
  { code: "ti", name: "ትግርኛ" }, // Tigrinya
  { code: "to", name: "Faka-Tonga" }, // Tonga (Tonga Islands)
  { code: "ts", name: "Xitsonga" }, // Tsonga
  { code: "tn", name: "Setswana" }, // Tswana
  { code: "tr", name: "Türkçe" }, // Turkish
  { code: "tk", name: "Türkmen dili" }, // Turkmen
  { code: "tw", name: "Twi" }, // Twi
  { code: "ug", name: "ئۇيغۇرچە" }, // Uighur, Uyghur
  { code: "uk", name: "Українська" }, // Ukrainian
  { code: "ur", name: "اردو" }, // Urdu
  { code: "ve", name: "Tshivenḓa" }, // Venda
  { code: "vi", name: "Tiếng Việt" }, // Vietnamese
  { code: "vo", name: "Volapük" }, // Volapük
  { code: "wa", name: "Walon" }, // Walloon
  { code: "cy", name: "Cymraeg" }, // Welsh
  { code: "fy", name: "Frysk" }, // Western Frisian
  { code: "wo", name: "Wolof" }, // Wolof
  { code: "xh", name: "isiXhosa" }, // Xhosa
  { code: "yi", name: "ייִדיש" }, // Yiddish
  { code: "yo", name: "Yorùbá" }, // Yoruba
  { code: "za", name: "Cuengh" }, // Zhuang, Chuang
  { code: "zu", name: "isiZulu" }, // Zulu
] as const;

export type LanguageCode = (typeof languages)[number]["code"];
export type LanguageName = (typeof languages)[number]["name"];
export type LanguageOption = Record<LanguageCode, LanguageName>;

export const LANGUAGE_LIST: readonly {
  code: LanguageCode;
  name: LanguageName;
}[] = languages;
export const LANGUAGE_NAME_MAP: LanguageOption =
  languages.reduce((acc, lang) => {
    acc[lang.code] = lang.name;
    return acc;
  }, {} as LanguageOption);
export const LANGUAGE_CODE_MAP: LanguageOption =
  languages.reduce((acc, lang) => {
    acc[lang.name] = lang.code;
    return acc;
  }, {} as LanguageOption);
