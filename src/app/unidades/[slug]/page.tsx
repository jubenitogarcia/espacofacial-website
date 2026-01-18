import { redirect } from "next/navigation";

export default function UnitPage({ params }: { params: { slug: string } }) {
  redirect(`/#unit-${params.slug}`);
}
