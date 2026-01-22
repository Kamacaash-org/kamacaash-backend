export function generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) otp += digits[Math.floor(Math.random() * digits.length)];
    return otp;
}

export async function sendOTP(phoneNumber: string, otp: string) {
    // Placeholder: integrate real SMS provider here
    // For now just log
    console.log(`Sending OTP ${otp} to ${phoneNumber}`);
    return true;
}
