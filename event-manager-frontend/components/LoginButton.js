import { useRouter } from 'next/router';

const LoginButton = () => {
    const router = useRouter();

    const handleLogin = () => {
        router.push('/login');
    };

    return (
        <button onClick={handleLogin} className="login-button">
            Login
            <style jsx>{`
                .login-button {
                    background-color: #0070f3;
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    cursor: pointer;
                    border-radius: 4px;
                }
            `}</style>
        </button>
    );
};

export default LoginButton;
