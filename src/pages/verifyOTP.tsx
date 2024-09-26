import api from "@/api";
import { useEffect, useState } from "react";
import { Label } from '../components/components/ui/label';
import { Input } from '../components/components/ui/input';
import { Button } from '../components/components/ui/button';
//import jwt_decode from 'jwt-decode';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';
import { useRouter } from "next/router";

// so that typescript can understand structure of decoded token
interface DecodedToken {
    id: number;
    username: string;
    role: string;
    iat: number;
    exp: number;
}

const VerifyOTP = () => {
    const [otp, setOTP] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();
    useEffect(() => {
        const token = Cookies.get('authToken');  // Assuming you have stored the token in a cookie
        if (token) {
            //const decoded: DecodedToken = jwt_decode(token);    // Decode the token
            const decoded = jwtDecode<DecodedToken>(token);
            console.log("decoded jwt", decoded);
            setUserId(decoded.id.toString());  // Extract the userId (depending on the structure of your JWT payload)
        }
    }, []);

    const handleOTPSubmit = async () => {

        try {
            const response = await api.post('/api/business/verifyOtp', { otp, userId });

            if (response.status === 200) {
                setSuccess('OTP verified successfully!');
                Cookies.remove('authToken'); // Remove the OTP token if verified
                router.push('/Login');// Redirect to Login for manual login
            } else {
                setError('Invalid OTP.');
            }
        } catch (error) {
            setError('Error verifying OTP. Please try again.');
        }
    };

    const handleResendOTP = async () => {
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                setError('No token found. Please log in.');
                return;
            }

            const response = await api.post('/api/business/resendOtp', { userId });
            if (response.status === 200) {
                setSuccess('A new OTP has been sent to your email.');
            } else {
                setError('Error resending OTP. Please try again.');
            }
        } catch (error) {
            setError('Error resending OTP. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center mt-10">
            <h2 className="text-xl font-semibold mb-4">Verify Email</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <div className="flex items-center space-x-2 mb-4">
                <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value)}
                    className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <Button
                    onClick={handleOTPSubmit}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                    Submit OTP
                </Button>
            </div>

            <Button
                onClick={handleResendOTP}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
                Resend OTP
            </Button>

            {error && <p className='text-red-500 text-sm mt-4'>{error}</p>}
            {success && <p className='text-green-600 text-sm mt-4'>{success}</p>}
        </div>
    );
};

export default VerifyOTP;