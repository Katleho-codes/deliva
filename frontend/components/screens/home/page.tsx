"use client"
import MainNav from "@/components/MainNav";
import ProductsDisplay from "@/components/ProductsDisplay";
import { useCartContext } from "@/contexts/CartContext";
import { useSession } from "@/lib/auth-client";
import useSocket from "@/hooks/useSocket";
import SearchBar from "@/components/search/page";
import GuestLanding from "./GuestLanding";

export default function HomeScreen() {
  const {
    data: session,
    isPending, //loading state
  } = useSession()

  const { addToCart } = useCartContext()
  const handleAddToCart = (e: React.SyntheticEvent, product: {
    product_id: number;
    name: string;
    sale_price: number;
    main_image: string;
    slug: string;
  }) => {
    e.stopPropagation()
    addToCart({
      product_id: product.product_id,
      name: product.name,
      sale_price: product.sale_price,
      quantity: 1,
      image: product.main_image,
      slug: product.slug
    });
  };

  return (
    <>
      <MainNav />
      {session ? (
        <div className="lg:mx-auto lg:container max-w-7xl mx-auto px-6 lg:px-8 h-[calc(100vh-64px)]">
          <div>
            <h2 className="truncate font-regular">
              Hi <span className="font-medium">{session.user.name}</span>
            </h2>
            <div className="py-8 px-4">
              <SearchBar />
            </div>
            <ProductsDisplay handleAddToCart={handleAddToCart} />
          </div>
        </div>
      ) : isPending ? (
        <div className="grid min-h-[calc(100vh-64px)] place-content-center">
          <p className="text-sm text-[#999] animate-pulse">Loading...</p>
        </div>
      ) : (
        <GuestLanding />
      )}
    </>
  )
}
