import RoutePlaceholder from "@/components/shared/RoutePlaceholder";

interface ConfirmationPageProps {
  params: {
    booking_id: string;
  };
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  return <RoutePlaceholder title={`Booking Confirmation: ${params.booking_id}`} />;
}
