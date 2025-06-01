import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'
import Link from 'next/link';
import Image from 'next/image';
import { getUserUrl, getProductUrl } from '@/baseurl';


function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return Date.now() >= payload.exp * 1000
    } catch {
        return true
    }
}

export default function ProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('account');
    const [formData, setFormData] = useState({
        account: {
            username: '',
            email: '',
            fullname: '',
            date_of_birth: '',
            sex: '',
            tel: '',
        },
        address: {
            receiver_name: '',
            house_number: '',
            district: '',
            province: '',
            post_code: '',
            is_default: false,
        },
        history: {
            customer: '',
            status: '',
            totalPrice: '',
            createdAt: ''
        },
        payment: {
            method: '',
            card_no: '',
            expired: '',
            holder_name: '',
            is_default: false
        }
    });
    const [showChangePwd, setShowChangePwd] = useState(false);
    const [pwdFields, setPwdFields] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({})
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState('/images/bg1.jpeg');
    const [historyList, setHistoryList] = useState([]);
    const [addressList, setAddressList] = useState([]);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [defaultAddressId, setDefaultAddressId] = useState(null);
    const [paymentList, setPaymentList] = useState([]);
    const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
    const [defaultPaymentId, setDefaultPaymentId] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const STATUS_BADGE_CLASSES = {
        cart: 'bg-red-200    text-red-800',
        pending: 'bg-amber-200  text-amber-800',
        processing: 'bg-yellow-200 text-yellow-800',
        in_transit: 'bg-lime-200   text-lime-800',
        paid: 'bg-green-200  text-green-800',
        shipped: 'bg-teal-200   text-teal-800',
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('jwt_access');
        setIsLoggedIn(false);
        router.push('/');
    };

    useEffect(() => {
        if (isLoggedIn && activeTab === 'history') {
            const token = localStorage.getItem('jwt_access');
            fetch(`${getProductUrl()}/api/history/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(json => {
                    setHistoryList(json.orders || []);
                })
                .catch(err => console.error('Error fetching history:', err));
        }
    }, [isLoggedIn, activeTab]);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('jwt_access');
            const valid = !!token && !isTokenExpired(token);
            setIsLoggedIn(valid);

            if (!valid) {
                localStorage.removeItem('jwt_access');
                router.push('/login');
            }
        };

        checkAuth();
        const id = setInterval(checkAuth, 60000);
        return () => clearInterval(id);
    }, [router]);

    useEffect(() => {
        async function fetchProfile() {
            const token = localStorage.getItem('jwt_access')
            if (!token || isTokenExpired(token)) return;

            try {
                const res = await fetch(`${getUserUrl()}/api/myinfo/`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (!res.ok) throw new Error()
                const { data } = await res.json()
                setFormData({
                    account: {
                        username: data.user.username,
                        email: data.user.email,
                        fullname: data.fullname,
                        date_of_birth: data.date_of_birth,
                        sex: data.sex === 'Male'
                            ? 'Male'
                            : data.sex === 'Female'
                                ? 'Female'
                                : 'Other',
                        tel: data.tel,
                    }, address: {
                        receiver_name: '',
                        house_number: '',
                        district: '',
                        province: '',
                        post_code: '',
                        is_default: false
                    },
                    history: {
                        customer: '',
                        status: '',
                        totalPrice: '',
                        createdAt: ''
                    },
                    payment: {
                        method: '',
                        card_no: '',
                        expired: '',
                        holder_name: '',
                        is_default: false
                    },
                })
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        }

        if (isLoggedIn) {
            fetchProfile();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (isLoggedIn && activeTab === 'address') {
            const token = localStorage.getItem('jwt_access');
            fetch(`${getUserUrl()}/api/address/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(json => {
                    setAddressList(json.data);
                    const def = json.data.find(a => a.is_default);
                    if (def) setDefaultAddressId(def.id);
                });
        }
    }, [isLoggedIn, activeTab]);

    useEffect(() => {
        if (isLoggedIn && activeTab === 'payment') {
            const token = localStorage.getItem('jwt_access');
            fetch(`${getUserUrl()}/api/payment/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(json => {
                    setPaymentList(json.data);
                    const def = json.data.find(p => p.is_default);
                    if (def) setDefaultPaymentId(def.id);
                })
                .catch(err => console.error('Error fetching payment methods:', err));
        }
    }, [isLoggedIn, activeTab]);

    const toggleChangePassword = () => {
        setShowChangePwd(prev => !prev);
        setPwdFields({ newPassword: '', confirmPassword: '' });
        setErrors({});
    };

    const handlePwdChange = e => {
        const { name, value } = e.target;
        setPwdFields(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async e => {
        e.preventDefault();
        setErrors({});

        if (pwdFields.newPassword !== pwdFields.confirmPassword) {
            setErrors({ confirm_password: ['รหัสผ่านทั้งสองช่องต้องตรงกัน'] });
            return;
        }

        const token = localStorage.getItem('jwt_access');
        try {
            const res = await fetch(`${getUserUrl()}/api/change_password/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    new_password: pwdFields.newPassword,
                    confirm_password: pwdFields.confirmPassword,
                }),
            });

            const data = await res.json();
            console.log('change_password response:', data, 'status:', res.status);

            if (!res.ok) {
                setErrors(data);
            } else {
                alert('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
                setShowChangePwd(false);
                setPwdFields({ newPassword: '', confirmPassword: '' });
            }

        } catch (err) {
            console.error('Network or parsing error:', err);
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        }
    };



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], [name]: value },
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault()
        setErrors({})

        const token = localStorage.getItem('jwt_access')
        const payload = {
            user: {
                username: formData.account.username,
                email: formData.account.email,
            },
            fullname: formData.account.fullname,
            date_of_birth: formData.account.date_of_birth,
            sex: formData.account.sex,
            tel: formData.account.tel,
        }

        try {
            const res = await fetch(`${getUserUrl()}/api/myinfo/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })
            const data = await res.json()

            if (response.status === 401) {
                alert("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
                localStorage.removeItem("jwt_access");
                router.push("/login");
                return;
            }


            if (!res.ok) {
                console.log('Validation errors from API:', data)
                setErrors(data)
                return
            }

            router.push('/myprofile')
        } catch (err) {
            console.error('Fetch error:', err)
        }
        alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
    }

    const handleDefaultAddress = async (addrId) => {
        const token = localStorage.getItem('jwt_access');
        const res = await fetch(`${getUserUrl()}/api/address/${addrId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ is_default: true }),
        });

        if (!res.ok) return console.error('Fail to set default');
        setDefaultAddressId(addrId);
        setAddressList(prev =>
            prev.map(a => ({ ...a, is_default: a.id === addrId }))
        );
    };

    const fetchAddressList = async () => {
        const token = localStorage.getItem('jwt_access');
        fetch(`${getUserUrl()}/api/address/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(json => {
                setAddressList(json.data);
                const def = json.data.find(a => a.is_default);
                if (def) setDefaultAddressId(def.id);
            })
            .catch(err => console.error('Error fetching addresses:', err));
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwt_access');
        const postCode = formData.address.post_code;

        if (postCode.length > 5) {
            alert("รหัสไปรษณีย์ต้องไม่เกิน 5 ตัวอักษร");
            return;
        }

        const addressData = {
            receiver_name: formData.address.receiver_name,
            house_number: formData.address.house_number,
            district: formData.address.district,
            province: formData.address.province,
            post_code: postCode,
            is_default: formData.address.is_default,
        };

        try {
            const response = await fetch(`${getUserUrl()}/api/address/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(addressData),
            });

            if (response.status === 401) {
                alert("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
                localStorage.removeItem("jwt_access");
                router.push("/login");
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to submit address');
            }

            setFormData(prev => ({
                ...prev,
                address: {
                    receiver_name: '',
                    house_number: '',
                    district: '',
                    province: '',
                    post_code: '',
                    is_default: false,
                },
            }));

            setShowNewAddressForm(false);
            await fetchAddressList();
            const responseData = await response.json();
            console.log('บันทึกที่อยู่สำเร็จ', responseData);
            alert('บันทึกที่อยู่สำเร็จ')
        } catch (error) {
            console.error('Error submitting address:', error);
            alert('บันทึกที่ไม่สำเร็จ')
        }
    };

    const handleDefaultPayment = async (pmId) => {
        const token = localStorage.getItem('jwt_access');
        const res = await fetch(`${getUserUrl()}/api/payment/${pmId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ is_default: true }),
        });

        if (!res.ok) return console.error('Fail to set default payment method');
        setDefaultPaymentId(pmId);
        setPaymentList(prev =>
            prev.map(p => ({ ...p, is_default: p.id === pmId }))
        );
    };

    const fetchPaymentList = async () => {
        const token = localStorage.getItem('jwt_access');
        fetch(`${getUserUrl()}/api/payment/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(json => {
                setPaymentList(json.data);
                const def = json.data.find(p => p.is_default);
                if (def) setDefaultPaymentId(def.id);
            })
            .catch(err => console.error('Error fetching payment methods:', err));
    };


    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwt_access');
        const card_no = formData.payment.card_no;

        if (card_no.length > 16) {
            alert("เลขบัตรเครดิตต้องไม่เกิน 16 ตัว");
            return;
        }

        const paymentData = {
            method: formData.payment.method,
            card_no: card_no,
            expired: formData.payment.expired,
            holder_name: formData.payment.holder_name,
            is_default: formData.payment.is_default,
        };

        try {
            const response = await fetch(`${getUserUrl()}/api/payment/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(paymentData),
            });

            if (response.status === 401) {
                alert("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
                localStorage.removeItem("jwt_access");
                router.push("/login");
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to submit payment');
            }

            setFormData(prev => ({
                ...prev,
                payment: {
                    method: '',
                    card_no: '',
                    expired: '',
                    holder_name: '',
                    is_default: false,
                },
            }));

            setShowNewPaymentForm(false);
            fetchPaymentList();
            const responseData = await response.json();
            console.log('บันทึกข้อมูลการชำระเงินสำเร็จ', responseData);
            alert('บันทึกข้อมูลการชำระเงินสำเร็จ');
        } catch (error) {
            console.error('Error submitting payment:', error);
            alert('บันทึกการชำระเงินไม่สำเร็จ');
        }
    };



    const navLinks = [
        { name: 'Account', href: '/profile', tab: 'account', active: activeTab === 'account' },
        { name: 'Address', href: '/address', tab: 'address', active: activeTab === 'address' },
        { name: 'History', href: '/history', tab: 'history', active: activeTab === 'history' },
        { name: 'Payment', href: '/payment', tab: 'payment', active: activeTab === 'payment' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#fdf6e3] animate-fade-in">
            Google Fonts
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
      `}</style>
            <div
                className="fixed inset-0 bg-cover bg-center transition-opacity duration-300 z-0"
                style={{
                    backgroundImage: backgroundImage
                        ? `url(${backgroundImage})`
                        : 'linear-gradient(to bottom, #f4d03f, #fdf6e3)',
                }}
            >
                <div className="absolute inset-0 bg-[#8b4513]/10"></div>
            </div>
            <header className="fixed top-0 w-full bg-[#fff8e1] shadow-md z-50">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-2 relative group">
                        <Image src="/images/logo.png" width={65} height={40} alt="Logo" />
                    </Link>
                    <nav className="flex gap-6">
                        {['Home', 'About Us', 'Product'].map((text, idx) => {
                            const href = text === 'Home' ? '/' : text === 'About Us' ? '/about' : '/product-list';
                            return (
                                <Link
                                    key={idx}
                                    href={href}
                                    className="relative text-[#8b4513] font-semibold group"
                                >
                                    <span>
                                        {text}
                                        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#f4d03f] group-hover:w-full transition-all duration-300"></span>
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex gap-4 items-center">
                        {isLoggedIn ? (
                            <>
                                <Link href="/order" className="p-2 border border-[#8b4513] rounded-full hover:bg-[#f4d03f] transition-colors duration-200">🛒</Link>
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="w-10 h-10 rounded-full overflow-hidden border hover:ring-2 ring-yellow-500 transition-all duration-200"
                                    >
                                        <Image src="/icons/user.png" alt="Profile" width={40} height={40} />
                                    </button>
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
                                            <Link
                                                href="/myprofile"
                                                className="block px-4 py-2 text-yellow-700 hover:bg-gray-100"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-[#f4d03f] hover:bg-[#e6c02f] text-[#8b4513] font-bold px-4 py-2 rounded-full transition-colors duration-200"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 relative z-10 pt-24 pb-32">
                <aside className="w-64 bg-[#fff8e1] p-6 fixed h-[calc(100vh-6rem)] top-24 border-r border-[#8b4513]/30">
                    <h2 className="text-2xl font-semibold text-[#8b4513] mb-6">My Account</h2>
                    <nav className="space-y-3">
                        {navLinks.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(link.tab)}
                                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${link.active
                                    ? 'bg-[#f4d03f] text-[#8b4513] font-semibold'
                                    : 'text-[#8b4513] hover:bg-[#f4d03f]/50'
                                    }`}
                            >
                                {link.name}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="flex-1 ml-64 p-6">
                    <div className="max-w-3xl mx-auto bg-[#fff8e1] p-8 border border-[#8b4513]/30 rounded-lg shadow-md">
                        <h1 className="text-3xl font-bold text-[#8b4513] mb-6">
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h1>

                        {activeTab === 'account' && (
                            <>
                                {!showChangePwd && (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                    Username *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={formData.account.username}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                                />
                                                {errors.user?.username && (
                                                    <p className="text-red-500 text-sm">{errors.user.username}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                    Telephone *
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="tel"
                                                    value={formData.account.tel}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                                />
                                                {errors.tel && <p className="text-red-500 text-sm">{errors.tel}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Fullname *
                                            </label>
                                            <input
                                                type="text"
                                                name="fullname"
                                                value={formData.account.fullname}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                            {errors.fullname && (
                                                <p className="text-red-500 text-sm">{errors.fullname}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                    Date of Birth *
                                                </label>
                                                <input
                                                    type="date"
                                                    name="date_of_birth"
                                                    value={formData.account.date_of_birth}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                                />
                                                {errors.date_of_birth && (
                                                    <p className="text-red-500 text-sm">{errors.date_of_birth}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                    Sex *
                                                </label>
                                                <select
                                                    name="sex"
                                                    value={formData.account.sex}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                {errors.sex && (
                                                    <p className="text-red-500 text-sm">{errors.sex}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.account.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                            {errors.user?.email && (
                                                <p className="text-red-500 text-sm">{errors.user.email}</p>
                                            )}
                                        </div>
                                        <div className="text-right mb-4">
                                            <button
                                                type="button"
                                                onClick={toggleChangePassword}
                                                className="text-sm text-[#8b4513] hover:text-[#f4d03f] transition-colors duration-200"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <button
                                                type="submit"
                                                className="bg-[#f4d03f] text-[#8b4513] px-6 py-3 rounded-lg hover:bg-[#e6c02f] transition-colors duration-200 font-semibold"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {showChangePwd && (
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-1">
                                                New Password *
                                            </label>
                                            {errors.non_field_errors?.length > 0 && (
                                                <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded mb-2">
                                                    {errors.non_field_errors.map((msg, i) => (
                                                        <p key={i} className="text-sm">{msg}</p>
                                                    ))}
                                                </div>
                                            )}
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={pwdFields.newPassword}
                                                onChange={handlePwdChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3]"
                                            />
                                            {errors.new_password?.map((msg, idx) => (
                                                <p key={idx} className="text-red-500 text-sm mt-1">{msg}</p>
                                            ))}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-1">
                                                Confirm New Password *
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={pwdFields.confirmPassword}
                                                onChange={handlePwdChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3]"
                                            />
                                            {errors.confirm_password?.map((msg, idx) => (
                                                <p key={idx} className="text-red-500 text-sm mt-1">{msg}</p>
                                            ))}
                                        </div>
                                        <div className="text-right mb-4">
                                            <button
                                                type="button"
                                                onClick={toggleChangePassword}
                                                className="text-sm text-[#8b4513] hover:text-[#f4d03f] transition-colors duration-200"
                                            >
                                                Cancel Change Password
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <button
                                                type="submit"
                                                className="bg-[#f4d03f] text-[#8b4513] px-6 py-3 rounded-lg hover:bg-[#e6c02f] transition-colors duration-200 font-semibold"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}


                        {activeTab === 'address' && (
                            <div>
                                {!showNewAddressForm ? (
                                    <div className="space-y-3">
                                        {addressList.map(addr => (
                                            <label
                                                key={addr.id}
                                                className="flex items-center space-x-2 p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3]"
                                            >
                                                <input
                                                    type="radio"
                                                    name="defaultAddress"
                                                    value={addr.id}
                                                    checked={defaultAddressId === addr.id}
                                                    onChange={() => handleDefaultAddress(addr.id)}
                                                    className="accent-[#8b4513]"
                                                />
                                                <div className="text-[#8b4513]">
                                                    <p className="font-semibold">{addr.receiver_name}</p>
                                                    <p className="text-sm">
                                                        {addr.house_number}, {addr.district}, {addr.province} {addr.post_code}
                                                    </p>
                                                    {addr.is_default && <span className="text-xs text-green-700">Default</span>}
                                                </div>
                                            </label>
                                        ))}

                                        <div className="text-left mt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowNewAddressForm(true)}
                                                className="px-6 py-2 bg-[#f4d03f] text-[#8b4513] rounded-lg hover:bg-[#e6c02f] transition-colors duration-200 font-semibold"
                                            >
                                                + Add Address
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 p-4 mt-4 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3]">
                                        {['receiver_name', 'house_number', 'district', 'province', 'post_code'].map(field => (
                                            <div key={field}>
                                                <label className="block text-sm font-medium text-[#8b4513] mb-2 capitalize">
                                                    {field.replace('_', ' ')} *
                                                </label>
                                                <input
                                                    type="text"
                                                    name={field}
                                                    required
                                                    value={formData.address[field]}
                                                    onChange={handleChange}
                                                    className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-white text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                                />
                                            </div>
                                        ))}
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                name="is_default"
                                                checked={formData.address.is_default || false}
                                                onChange={e =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        address: { ...prev.address, is_default: e.target.checked },
                                                    }))
                                                }
                                                className="accent-[#8b4513]"
                                            />
                                            <label className="text-[#8b4513]">Set as default</label>
                                        </div>
                                        <div className="flex justify-between">
                                            <button
                                                type="button"
                                                onClick={() => setShowNewAddressForm(false)}
                                                className="bg-[#f4d03f] text-[#8b4513] px-6 py-3 rounded-lg hover:bg-[#e6c02f] transition-colors duration-200 font-semibold"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAddressSubmit}
                                                className="bg-[#f4d03f] text-[#8b4513] px-6 py-3 rounded-lg hover:bg-[#e6c02f] transition-colors duration-200 font-semibold"
                                            >
                                                Save Address
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <>
                                <div className="space-y-4">
                                    {historyList.filter(order => order.items.length > 0).length === 0 ? (
                                        <p className="text-gray-500">ยังไม่มีรายการสั่งซื้อ</p>
                                    ) : (
                                        historyList
                                            .filter(order => order.items.length > 0)
                                            .map(order => (
                                                <div key={order.id} className="p-4 border rounded-lg bg-white">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-semibold">Order #{order.id}</span>
                                                        <span
                                                            className={`text-sm px-2 py-1 rounded-full ${STATUS_BADGE_CLASSES[order.status] || 'bg-gray-200 text-gray-800'
                                                                }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="mb-2">
                                                        <span className="font-medium">Total:</span> ฿{order.total_price}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {order.items.map(item => (
                                                            <div key={item.id} className="flex justify-between">
                                                                <span>{item.product_name} x{item.quantity}</span>
                                                                <span>฿{item.total_price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Link href={`/summarize/${order.id}`}
                                                        className="inline-block mt-3 text-sm text-[#8b4513] hover:underline">
                                                        ดูรายละเอียดเพิ่มเติม →
                                                    </Link>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'payment' && (
                            <div>
                                {!showNewPaymentForm ? (
                                    <div className="space-y-3">
                                        {paymentList.map(pm => (
                                            <label
                                                key={pm.id}
                                                className="flex items-center space-x-2 p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3]"
                                            >
                                                <input
                                                    type="radio"
                                                    name="defaultPayment"
                                                    value={pm.id}
                                                    checked={defaultPaymentId === pm.id}
                                                    onChange={() => handleDefaultPayment(pm.id)}
                                                    className="accent-[#8b4513]"
                                                />
                                                <div className="text-[#8b4513]">
                                                    <p className="font-semibold">{pm.method}</p>
                                                    <p className="text-sm">
                                                        •••• •••• •••• {pm.card_no.slice(-4)}
                                                    </p>
                                                    {pm.is_default && <span className="text-xs text-green-700">Default</span>}
                                                </div>
                                            </label>
                                        ))}

                                        <div className="text-left mt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPaymentForm(true)}
                                                className="px-6 py-2 bg-[#f4d03f] text-[#8b4513] rounded-lg hover:bg-[#e6c02f] transition-colors duration-200 font-semibold"
                                            >
                                                + Add Payment Method
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 p-4 mt-4 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3]">
                                        {['method', 'card_no', 'expired', 'holder_name'].map(field => (
                                            <div key={field}>
                                                <label className="block text-sm font-medium text-[#8b4513] mb-2 capitalize">
                                                    {field === 'method'
                                                        ? 'Payment Method'
                                                        : field === 'card_no'
                                                            ? 'Card Number'
                                                            : field === 'expired'
                                                                ? 'Expiration (MM/YY)'
                                                                : 'Cardholder Name'} *
                                                </label>
                                                <input
                                                    type="text"
                                                    name={field}
                                                    required
                                                    value={formData.payment[field]}
                                                    onChange={handleChange}
                                                    className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-white text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                                    maxLength={16}
                                                />
                                            </div>
                                        ))}

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                name="is_default"
                                                checked={formData.payment.is_default}
                                                onChange={handleChange}
                                                className="accent-[#8b4513]"
                                            />
                                            <label className="text-[#8b4513]">Set as default</label>
                                        </div>

                                        <div className="flex justify-between">
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPaymentForm(false)}
                                                className="bg-[#f4d03f] text-[#8b4513] px-6 py-3 rounded-lg hover:bg-[#e6c02f] transition-colors duration-200 font-semibold"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handlePaymentSubmit}
                                                className="bg-[#f4d03f] text-[#8b4513] px-6 py-3 rounded-lg hover:bg-[#e6c02f] transition-colors duration-200 font-semibold"
                                            >
                                                Save Payment Method
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <footer className="relative z-10 bg-gray-100 py-6">
                <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4].map((_, idx) => (
                        <span key={idx} className="w-4 h-4 bg-gray-400 rounded-full inline-block" />
                    ))}
                </div>
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-gray-600">
                    <span>About us</span>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="relative text-gray-600 font-medium group mt-2 sm:mt-0"
                    >
                        <span className="relative inline-block px-1">
                            Back to top ↑
                            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gray-500 group-hover:w-full transition-all duration-300" />
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
}