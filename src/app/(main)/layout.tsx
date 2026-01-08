import { ElectricFilterDef } from '@/components/ElectricFilterDef';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ElectricFilterDef />
      {children}
    </>
  );
}



