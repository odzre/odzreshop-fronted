"use client";

import { useEffect, useState } from "react";

export default function Page() {
    const [data, setData] = useState(null);


    useEffect(() => {
        fetch("/api/client-info")
            .then(res => res.json())
            .then(res => setData(res));
    }, []);

    return (
        <pre>{JSON.stringify(data, null, 2)}</pre>
    );
}