import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'mr';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

export const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

// Translation strings
const enTranslations = {
    // Common
    home: 'Home',
    scan: 'Scan',
    community: 'Community',
    profile: 'Profile',
    settings: 'Settings',
    save: 'Save Changes',
    saving: 'Saving...',
    cancel: 'Cancel',

    // Profile
    totalScans: 'Total Scans',
    healthyPlants: 'Healthy Plants',
    scanHistory: 'Scan History',
    viewPastDiagnoses: 'View your past diagnoses',
    updateProfileInfo: 'Update profile info',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    guestUser: 'Guest User',
    signInToSave: 'Sign in to save your scan history',

    // Settings
    fullName: 'Full Name',
    enterFullName: 'Enter your full name',
    phoneNumber: 'Phone Number',
    enterPhone: 'Enter your phone number',
    locationDistrict: 'Location / District',
    enterLocation: 'Enter your location or district',
    language: 'Language',
    selectLanguage: 'Select your preferred language',
    profileUpdated: 'Profile updated successfully',
    failedToUpdate: 'Failed to update profile',
    failedToLoad: 'Failed to load profile',

    // Scan
    scanYourPlant: 'Scan Your Plant',
    takePhoto: 'Take a photo of your plant leaf',
    analyzing: 'Analyzing...',
    result: 'Result',
    confidence: 'Confidence',
    healthy: 'Healthy',

    // Auth
    welcomeBack: 'Welcome back',
    createAccount: 'Create an account',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    signUp: 'Sign Up',
    orContinueWith: 'Or continue with',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",

    // Result Card
    chemical: 'Chemical Treatment',
    natural: 'Natural Treatment',
    prevention: 'Prevention Tips',
    share: 'Share',
    scanAgain: 'Scan Again',
    aiVerified: 'AI Verified',
    readAloud: 'Read Aloud',
    stopReading: 'Stop Reading',
    cropIdentified: 'Crop Identified',
    noCropDetected: 'No Crop Detected',
    diseaseDetected: 'Disease Detected',
    healthyPlant: 'Healthy Plant',
    confidenceScore: 'AI Confidence',
};

// Translation strings
const translations: Record<Language, Record<string, string>> = {
  en: enTranslations,
  hi: {
    home: 'होम',
    scan: 'स्कैन',
    community: 'समुदाय',
    profile: 'प्रोफ़ाइल',
    settings: 'सेटिंग्स',
    save: 'परिवर्तन सहेजें',
    saving: 'सहेज रहे हैं...',
    cancel: 'रद्द करें',
    totalScans: 'कुल स्कैन',
    healthyPlants: 'स्वस्थ पौधे',
    scanHistory: 'स्कैन इतिहास',
    viewPastDiagnoses: 'अपने पिछले निदान देखें',
    updateProfileInfo: 'प्रोफ़ाइल जानकारी अपडेट करें',
    signIn: 'साइन इन',
    signOut: 'साइन आउट',
    guestUser: 'अतिथि उपयोगकर्ता',
    signInToSave: 'अपना स्कैन इतिहास सहेजने के लिए साइन इन करें',
    fullName: 'पूरा नाम',
    enterFullName: 'अपना पूरा नाम दर्ज करें',
    phoneNumber: 'फ़ोन नंबर',
    enterPhone: 'अपना फ़ोन नंबर दर्ज करें',
    locationDistrict: 'स्थान / जिला',
    enterLocation: 'अपना स्थान या जिला दर्ज करें',
    language: 'भाषा',
    selectLanguage: 'अपनी पसंदीदा भाषा चुनें',
    profileUpdated: 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई',
    failedToUpdate: 'प्रोफ़ाइल अपडेट करने में विफल',
    failedToLoad: 'प्रोफ़ाइल लोड करने में विफल',
    scanYourPlant: 'अपने पौधे को स्कैन करें',
    takePhoto: 'अपने पौधे की पत्ती की फोटो लें',
    analyzing: 'विश्लेषण कर रहे हैं...',
    result: 'परिणाम',
    confidence: 'विश्वास',
    healthy: 'स्वस्थ',
    welcomeBack: 'वापस स्वागत है',
    createAccount: 'खाता बनाएं',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    signUp: 'साइन अप',
    orContinueWith: 'या इसके साथ जारी रखें',
    alreadyHaveAccount: 'पहले से खाता है?',
    dontHaveAccount: 'खाता नहीं है?',

    // Result Card
    chemical: 'रासायनिक उपचार',
    natural: 'प्राकृतिक उपचार',
    prevention: 'बचाव के उपाय',
    share: 'साझा करें',
    scanAgain: 'पुनः स्कैन करें',
    aiVerified: 'AI सत्यापित',
    readAloud: 'जोर से पढ़ें',
    stopReading: 'पढ़ना बंद करें',
    cropIdentified: 'फसल की पहचान',
    noCropDetected: 'कोई फसल नहीं मिली',
    diseaseDetected: 'रोग का पता चला',
    healthyPlant: 'स्वस्थ पौधा',
    confidenceScore: 'AI विश्वास',
  },
  ta: {
    home: 'முகப்பு',
    scan: 'ஸ்கேன்',
    community: 'சமூகம்',
    profile: 'சுயவிவரம்',
    settings: 'அமைப்புகள்',
    save: 'மாற்றங்களை சேமி',
    saving: 'சேமிக்கிறது...',
    cancel: 'ரத்துசெய்',
    totalScans: 'மொத்த ஸ்கேன்கள்',
    healthyPlants: 'ஆரோக்கியமான தாவரங்கள்',
    scanHistory: 'ஸ்கேன் வரலாறு',
    viewPastDiagnoses: 'உங்கள் கடந்த கால நோயறிதல்களைப் பார்க்கவும்',
    updateProfileInfo: 'சுயவிவர தகவலைப் புதுப்பிக்கவும்',
    signIn: 'உள்நுழை',
    signOut: 'வெளியேறு',
    guestUser: 'விருந்தினர் பயனர்',
    signInToSave: 'உங்கள் ஸ்கேன் வரலாற்றைச் சேமிக்க உள்நுழையவும்',
    fullName: 'முழு பெயர்',
    enterFullName: 'உங்கள் முழு பெயரை உள்ளிடவும்',
    phoneNumber: 'தொலைபேசி எண்',
    enterPhone: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
    locationDistrict: 'இருப்பிடம் / மாவட்டம்',
    enterLocation: 'உங்கள் இருப்பிடம் அல்லது மாவட்டத்தை உள்ளிடவும்',
    language: 'மொழி',
    selectLanguage: 'உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
    profileUpdated: 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
    failedToUpdate: 'சுயவிவரத்தைப் புதுப்பிக்க முடியவில்லை',
    failedToLoad: 'சுயவிவரத்தை ஏற்ற முடியவில்லை',
    scanYourPlant: 'உங்கள் தாவரத்தை ஸ்கேன் செய்யுங்கள்',
    takePhoto: 'உங்கள் தாவர இலையின் புகைப்படம் எடுங்கள்',
    analyzing: 'பகுப்பாய்வு செய்கிறது...',
    result: 'முடிவு',
    confidence: 'நம்பிக்கை',
    healthy: 'ஆரோக்கியமான',
    welcomeBack: 'மீண்டும் வரவேற்கிறோம்',
    createAccount: 'கணக்கை உருவாக்கு',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்து',
    signUp: 'பதிவு செய்',
    orContinueWith: 'அல்லது தொடரவும்',
    alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    dontHaveAccount: 'கணக்கு இல்லையா?',

    // Result Card (English fallbacks/simple translations for now to avoid errors, ideally should be localized)
    chemical: 'இரசாயன சிகிச்சை',
    natural: 'இயற்கை சிகிச்சை',
    prevention: 'தடுப்பு குறிப்புகள்',
    share: 'பகிர்',
    scanAgain: 'மீண்டும் ஸ்கேன் செய்',
    aiVerified: 'AI சரிபார்க்கப்பட்டது',
    readAloud: 'சத்தமாக படி',
    stopReading: 'படிப்பத நிறுத்தவும்',
    cropIdentified: 'பயிர் அடையாளம் காணப்பட்டது',
    noCropDetected: 'பயிர் கண்டறியப்படவில்லை',
    diseaseDetected: 'நோய் கண்டறியப்பட்டது',
    healthyPlant: 'ஆரோக்கியமான தாவரம்',
    confidenceScore: 'AI நம்பிக்கை',
  },
  te: {
    home: 'హోమ్',
    scan: 'స్కాన్',
    community: 'సమాజం',
    profile: 'ప్రొఫైల్',
    settings: 'సెట్టింగ్‌లు',
    save: 'మార్పులను సేవ్ చేయండి',
    saving: 'సేవ్ చేస్తోంది...',
    cancel: 'రద్దు చేయండి',
    totalScans: 'మొత్తం స్కాన్‌లు',
    healthyPlants: 'ఆరోగ్యకరమైన మొక్కలు',
    scanHistory: 'స్కాన్ చరిత్ర',
    viewPastDiagnoses: 'మీ గత నిర్ధారణలను చూడండి',
    updateProfileInfo: 'ప్రొఫైల్ సమాచారాన్ని నవీకరించండి',
    signIn: 'సైన్ ఇన్',
    signOut: 'సైన్ అవుట్',
    guestUser: 'అతిథి వినియోగదారు',
    signInToSave: 'మీ స్కాన్ చరిత్రను సేవ్ చేయడానికి సైన్ ఇన్ చేయండి',
    fullName: 'పూర్తి పేరు',
    enterFullName: 'మీ పూర్తి పేరు నమోదు చేయండి',
    phoneNumber: 'ఫోన్ నంబర్',
    enterPhone: 'మీ ఫోన్ నంబర్ నమోదు చేయండి',
    locationDistrict: 'స్థానం / జిల్లా',
    enterLocation: 'మీ స్థానం లేదా జిల్లాను నమోదు చేయండి',
    language: 'భాష',
    selectLanguage: 'మీకు ఇష్టమైన భాషను ఎంచుకోండి',
    profileUpdated: 'ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది',
    failedToUpdate: 'ప్రొఫైల్ నవీకరించడంలో విఫలమైంది',
    failedToLoad: 'ప్రొఫైల్ లోడ్ చేయడంలో విఫలమైంది',
    scanYourPlant: 'మీ మొక్కను స్కాన్ చేయండి',
    takePhoto: 'మీ మొక్క ఆకు ఫోటో తీయండి',
    analyzing: 'విశ్లేషిస్తోంది...',
    result: 'ఫలితం',
    confidence: 'నమ్మకం',
    healthy: 'ఆరోగ్యకరమైన',
    welcomeBack: 'తిరిగి స్వాగతం',
    createAccount: 'ఖాతా సృష్టించండి',
    email: 'ఇమెయిల్',
    password: 'పాస్‌వర్డ్',
    confirmPassword: 'పాస్‌వర్డ్‌ను నిర్ధారించండి',
    signUp: 'సైన్ అప్',
    orContinueWith: 'లేదా కొనసాగించండి',
    alreadyHaveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
    dontHaveAccount: 'ఖాతా లేదా?',

    // Result Card
    chemical: 'రసాయన చికిత్స',
    natural: 'సహజ చికిత్స',
    prevention: 'నివారణ చిట్కాలు',
    share: 'భాగస్వామ్యం చేయండి',
    scanAgain: 'మళ్లీ స్కాన్ చేయండి',
    aiVerified: 'AI ధృవీకరించబడింది',
    readAloud: 'గట్టిగా చదవండి',
    stopReading: 'చదవడం ఆపివేయండి',
    cropIdentified: 'పంట గుర్తించబడింది',
    noCropDetected: 'పంట కనుగొనబడలేదు',
    diseaseDetected: 'వ్యాధి గుర్తించబడింది',
    healthyPlant: 'ఆరోగ్యకరమైన మొక్క',
    confidenceScore: 'AI నమ్మకం',
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    scan: 'ಸ್ಕ್ಯಾನ್',
    community: 'ಸಮುದಾಯ',
    profile: 'ಪ್ರೊಫೈಲ್',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    save: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
    saving: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...',
    cancel: 'ರದ್ದುಮಾಡಿ',
    totalScans: 'ಒಟ್ಟು ಸ್ಕ್ಯಾನ್‌ಗಳು',
    healthyPlants: 'ಆರೋಗ್ಯಕರ ಸಸ್ಯಗಳು',
    scanHistory: 'ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ',
    viewPastDiagnoses: 'ನಿಮ್ಮ ಹಿಂದಿನ ರೋಗನಿರ್ಣಯಗಳನ್ನು ನೋಡಿ',
    updateProfileInfo: 'ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿಯನ್ನು ನವೀಕರಿಸಿ',
    signIn: 'ಸೈನ್ ಇನ್',
    signOut: 'ಸೈನ್ ಔಟ್',
    guestUser: 'ಅತಿಥಿ ಬಳಕೆದಾರ',
    signInToSave: 'ನಿಮ್ಮ ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸವನ್ನು ಉಳಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ',
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    enterFullName: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    phoneNumber: 'ಫೋನ್ ಸಂಖ್ಯೆ',
    enterPhone: 'ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
    locationDistrict: 'ಸ್ಥಳ / ಜಿಲ್ಲೆ',
    enterLocation: 'ನಿಮ್ಮ ಸ್ಥಳ ಅಥವಾ ಜಿಲ್ಲೆಯನ್ನು ನಮೂದಿಸಿ',
    language: 'ಭಾಷೆ',
    selectLanguage: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    profileUpdated: 'ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ',
    failedToUpdate: 'ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಲು ವಿಫಲವಾಗಿದೆ',
    failedToLoad: 'ಪ್ರೊಫೈಲ್ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ',
    scanYourPlant: 'ನಿಮ್ಮ ಸಸ್ಯವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    takePhoto: 'ನಿಮ್ಮ ಸಸ್ಯದ ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ',
    analyzing: 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    result: 'ಫಲಿತಾಂಶ',
    confidence: 'ವಿಶ್ವಾಸ',
    healthy: 'ಆರೋಗ್ಯಕರ',
    welcomeBack: 'ಮರಳಿ ಸ್ವಾಗತ',
    createAccount: 'ಖಾತೆ ರಚಿಸಿ',
    email: 'ಇಮೇಲ್',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    confirmPassword: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
    signUp: 'ಸೈನ್ ಅಪ್',
    orContinueWith: 'ಅಥವಾ ಮುಂದುವರಿಸಿ',
    alreadyHaveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
    dontHaveAccount: 'ಖಾತೆ ಇಲ್ಲವೇ?',

    // Result Card
    chemical: 'ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ',
    natural: 'ನೈಸರ್ಗಿಕ ಚಿಕಿತ್ಸೆ',
    prevention: 'ತಡೆಗಟ್ಟುವ ಸಲಹೆಗಳು',
    share: 'ಹಂಚಿಕೊಳ್ಳಿ',
    scanAgain: 'ಮತ್ತೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    aiVerified: 'AI ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    readAloud: 'ಗಟ್ಟಿಯಾಗಿ ಓದಿ',
    stopReading: 'ಓದುವುದನ್ನು ನಿಲ್ಲಿಸಿ',
    cropIdentified: 'ಬೆಳೆ ಗುರುತಿಸಲಾಗಿದೆ',
    noCropDetected: 'ಯಾವುದೇ ಬೆಳೆ ಕಂಡುಬಂದಿಲ್ಲ',
    diseaseDetected: 'ರೋಗ ಪತ್ತೆಯಾಗಿದೆ',
    healthyPlant: 'ಆರೋಗ್ಯಕರ ಸಸ್ಯ',
    confidenceScore: 'AI ವಿಶ್ವಾಸ',
  },
  mr: {
    home: 'होम',
    scan: 'स्कॅन',
    community: 'समुदाय',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्ज',
    save: 'बदल जतन करा',
    saving: 'जतन करत आहे...',
    cancel: 'रद्द करा',
    totalScans: 'एकूण स्कॅन',
    healthyPlants: 'निरोगी वनस्पती',
    scanHistory: 'स्कॅन इतिहास',
    viewPastDiagnoses: 'तुमचे मागील निदान पहा',
    updateProfileInfo: 'प्रोफाइल माहिती अपडेट करा',
    signIn: 'साइन इन',
    signOut: 'साइन आउट',
    guestUser: 'अतिथी वापरकर्ता',
    signInToSave: 'तुमचा स्कॅन इतिहास जतन करण्यासाठी साइन इन करा',
    fullName: 'पूर्ण नाव',
    enterFullName: 'तुमचे पूर्ण नाव प्रविष्ट करा',
    phoneNumber: 'फोन नंबर',
    enterPhone: 'तुमचा फोन नंबर प्रविष्ट करा',
    locationDistrict: 'स्थान / जिल्हा',
    enterLocation: 'तुमचे स्थान किंवा जिल्हा प्रविष्ट करा',
    language: 'भाषा',
    selectLanguage: 'tumchi पसंतीची भाषा निवडा',
    profileUpdated: 'प्रोफाइल यशस्वीरित्या अपडेट झाली',
    failedToUpdate: 'प्रोफाइल अपडेट करण्यात अयशस्वी',
    failedToLoad: 'प्रोफाइल लोड करण्यात अयशस्वी',
    scanYourPlant: 'तुमच्या वनस्पतीला स्कॅन करा',
    takePhoto: 'तुमच्या वनस्पतीच्या पानाचा फोटो घ्या',
    analyzing: 'विश्लेषण करत आहे...',
    result: 'निकाल',
    confidence: 'विश्वास',
    healthy: 'निरोगी',
    welcomeBack: 'परत स्वागत आहे',
    createAccount: 'खाते तयार करा',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड पुष्टी करा',
    signUp: 'साइन अप',
    orContinueWith: 'किंवा सुरू ठेवा',
    alreadyHaveAccount: 'आधीच खाते आहे का?',
    dontHaveAccount: 'खाते नाही का?',

    // Result Card
    chemical: 'रासायनिक उपचार',
    natural: 'नैसर्गिक उपचार',
    prevention: 'प्रतिबंधात्मक टिप्स',
    share: 'शेअर करा',
    scanAgain: 'पुन्हा स्कॅन करा',
    aiVerified: 'AI सत्यापित',
    readAloud: 'मोठ्याने वाचा',
    stopReading: 'वाचणे थांबवा',
    cropIdentified: 'पीक ओळखले',
    noCropDetected: 'कोणतेही पीक आढळले नाही',
    diseaseDetected: 'रोग आढळला',
    healthyPlant: 'निरोगी वनस्पती',
    confidenceScore: 'AI विश्वास',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const { user } = useAuth();

  // Load language preference from profile or localStorage
  useEffect(() => {
    const stored = localStorage.getItem('language_pref');
    if (stored && languages.some(l => l.code === stored)) {
      setLanguageState(stored as Language);
    }
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language_pref', lang);
    // If user is logged in, you can save language pref to backend API here
  };

  const t = (key: string): string => {

    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
