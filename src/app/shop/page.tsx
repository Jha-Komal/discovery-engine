import { TopNav } from '@/components/layout/TopNav';
import { PhoneFrame } from '@/components/mvp/PhoneFrame';
import { ShopApp } from '@/components/mvp/ShopApp';

export default function ShopPage() {
  return (
    <>
      <TopNav
        title="Shop MVP"
        subtitle="Wishlist a few products, then let AI help you pick a finalist"
      />
      <div className="flex justify-center p-8">
        <PhoneFrame>
          <ShopApp />
        </PhoneFrame>
      </div>
    </>
  );
}
