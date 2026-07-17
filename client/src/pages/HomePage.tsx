import { useAuth } from "@/shared/hooks/useAuth";

export default function HomePage() {
    const { data, isPending } = useAuth();

    if (isPending) return <p>Loading...</p>;

    return (
        <pre>
            {JSON.stringify(data, null, 2)}
        </pre>
    );
}