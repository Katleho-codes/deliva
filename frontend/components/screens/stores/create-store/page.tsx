"use client"
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { ArrowLeft, Check, ImagePlus, Store, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSession } from '@/lib/auth-client';


interface AddStoreErrorMessages {
    name?: string;
    description?: string;
    phone?: string;
    address_line1?: string;
    city?: string;
    province?: string;
    postal_code?: string;
}

export default function CreateStoreScreen() {
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [createdStoreId, setCreatedStoreId] = useState<number | null>(null)
    const [createdStoreSlug, setCreatedStoreSlug] = useState<string | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = useSession()
    const [errors, setErrors] = useState<AddStoreErrorMessages>({}); // Explicitly typed
    // form state
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [address_line1, setAddressLine1] = useState("")
    const [address_line2, setAddressLine2] = useState("")
    const [city, setCity] = useState("")
    const [province, setProvince] = useState("")
    const [postal_code, setPostalCode] = useState("")
    const [country, setCountry] = useState("South Africa")

    const router = useRouter()

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoPreview(URL.createObjectURL(file))
            setLogoFile(file)
        }
    }

    const steps = [
        { id: 1, label: "Store" },
        { id: 2, label: "Contact" },
        { id: 3, label: "Address" },
    ]

    const onSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setIsSubmitting(true);
        const values = {
            name, description, email, phone,
            address_line1, address_line2,
            city, province, postal_code, country,
        }
        try {
            const response = await api.post("/api/stores", values);
            toast.success(response.data.message)
            setCreatedStoreId(response.data.rows.id)
            setCreatedStoreSlug(response.data.rows.slug)
            router.push("/stores/my-stores")
        } catch (error) {
            const err = error as AxiosError<any>;
            console.error("create store errors", error);

            if (err.response?.status === 403) {
                toast.error(err.response.data?.message);
                return;
            }

            if (err.response?.status === 400) {
                toast.error(err.response.data?.message);
                setErrors(err.response.data.errors || {});
                return;
            }

            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = async () => {
        if (!logoFile || !createdStoreId) return
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("image", logoFile)

            const response = await api.post(
                `/api/upload?type=store&id=${createdStoreId}`,
                formData,
            )
            toast.success(response?.data.message)
            router.push(`/stores/my-stores`)
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Upload failed")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <>
            {isPending ? (<p>Loading user...</p>) : session ? (
                <div className="min-h-screen">

                    {/* top bar */}
                    <div className="border-b border-[#E5E4DF] bg-white px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 text-sm text-[#666] hover:text-[#191919] transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Link>
                        <div className="flex items-center gap-2">
                            <Logo size="sm" />
                            <span className="font-semibold text-[#191919]">Deliva</span>
                        </div>
                        <div className="w-16" />
                    </div>

                    <div className="max-w-lg mx-auto px-4 py-10">

                        <>
                            {/* heading */}
                            <div className="mb-10">
                                <p className="text-xs font-semibold uppercase tracking-widest text-[#F86624] mb-2">New store</p>
                                <h1 className="text-3xl font-light text-[#191919]">
                                    Set up your<br /><em>spaza shop.</em>
                                </h1>
                            </div>

                            {/* step indicator */}
                            <div className="flex items-center mb-10">
                                {steps.map((s, i) => (
                                    <div key={s.id} className="flex items-center flex-1 last:flex-none">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${step === s.id ? "bg-[#F86624] text-white shadow-md shadow-orange-200" :
                                                step > s.id ? "bg-[#191919] text-white" :
                                                    "bg-[#E5E4DF] text-[#999]"
                                                }`}>
                                                {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
                                            </div>
                                            <span className={`text-sm font-medium ${step === s.id ? "text-[#191919]" : "text-[#999]"}`}>
                                                {s.label}
                                            </span>
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div className={`flex-1 h-px mx-3 ${step > s.id ? "bg-[#191919]" : "bg-[#E5E4DF]"}`} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={onSubmit}>

                                {/* step 1 */}
                                {step === 1 && (
                                    <div className="space-y-4 fade-in">
                                        <div className="float-label-input">
                                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Store name" />
                                            <label htmlFor="name">Store name</label>
                                        </div>

                                        {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name}</p>}
                                        <div className="float-label-input">
                                            <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" style={{ resize: "none", paddingTop: "22px" }} />
                                            <label htmlFor="description">Description</label>
                                        </div>

                                        <button type="button" onClick={() => setStep(2)}
                                            className="w-full h-12 rounded-xl bg-[#191919] text-white text-sm font-medium hover:bg-[#333] transition-colors">
                                            Continue →
                                        </button>
                                    </div>
                                )}

                                {/* step 2 */}
                                {step === 2 && (
                                    <div className="space-y-4 fade-in">
                                        <div className="float-label-input">
                                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                                            <label htmlFor="email">Email address</label>
                                        </div>

                                        <div className="float-label-input">
                                            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
                                            <label htmlFor="phone">Phone number</label>
                                        </div>
                                        {errors.phone && <p className="text-sm text-red-500 font-medium">{errors.phone}</p>}
                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => setStep(1)}
                                                className="flex-1 h-12 rounded-xl border-2 border-[#E5E4DF] text-sm text-[#666] hover:border-[#999] transition-colors">
                                                ← Back
                                            </button>
                                            <button type="button" onClick={() => setStep(3)}
                                                className="flex-1 h-12 rounded-xl bg-[#191919] text-white text-sm font-medium hover:bg-[#333] transition-colors">
                                                Continue →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* step 3 */}
                                {step === 3 && (
                                    <div className="space-y-4 fade-in">
                                        <div className="float-label-input">
                                            <input type="text" id="address_line1" value={address_line1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Address line 1" />
                                            <label htmlFor="address_line1">Address line 1</label>
                                        </div>
                                        {errors?.address_line1 && <p className="text-sm text-red-500 font-medium">{errors?.address_line1}</p>}
                                        <div className="float-label-input">
                                            <input type="text" id="address_line2" value={address_line2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Address line 2 (optional)" />
                                            <label htmlFor="address_line2">Address line 2</label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="float-label-input">
                                                <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                                                <label htmlFor="city">City</label>
                                                {errors.city && <p className="text-sm text-red-500 font-medium">{errors.city}</p>}
                                            </div>

                                            <div className="float-label-input">
                                                <select id="province" value={province} onChange={(e) => setProvince(e.target.value)}>
                                                    <option value="">Select</option>
                                                    <option>Eastern Cape</option>
                                                    <option>Free State</option>
                                                    <option>Gauteng</option>
                                                    <option>KwaZulu-Natal</option>
                                                    <option>Limpopo</option>
                                                    <option>Mpumalanga</option>
                                                    <option>Northern Cape</option>
                                                    <option>North West</option>
                                                    <option>Western Cape</option>
                                                </select>
                                                <label htmlFor="province">Province</label>
                                                {errors.province && <p className="text-sm text-red-500 font-medium">{errors.province}</p>}
                                            </div>

                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="float-label-input">
                                                <input type="text" id="postal_code" value={postal_code} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal code" maxLength={4} />
                                                <label htmlFor="postal_code">Postal code</label>
                                                {errors.postal_code && <p className="text-sm text-red-500 font-medium">{errors.postal_code}</p>}
                                            </div>

                                            <div className="float-label-input">
                                                <input type="text" id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
                                                <label htmlFor="country">Country</label>
                                            </div>

                                        </div>
                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => setStep(2)}
                                                className="flex-1 h-12 rounded-xl border-2 border-[#E5E4DF] text-sm text-[#666] hover:border-[#999] transition-colors">
                                                ← Back
                                            </button>
                                            <button type="submit" disabled={isSubmitting}
                                                className="flex-1 h-12 rounded-xl bg-linear-to-r from-[#F86624] to-[#F15025] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                                                {isSubmitting ? "Creating..." : "Create store"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>

                            <p className="text-center text-xs text-[#999] mt-8">
                                Step {step} of 3 · {step === 1 ? "Store details" : step === 2 ? "Contact info" : "Your address"}
                            </p>
                        </>

                    </div>
                </div>
            ) : (
                <Link href={"/auth/login"}>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 cursor-pointer">
                        Login/signup
                    </Button>
                </Link>
            )}

        </>
    );
}