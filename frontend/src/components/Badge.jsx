export default function Badge({ type }) {

    const colors = {

        low: "bg-green-500/10 text-green-500",
        medium: "bg-yellow-500/10 text-yellow-500",
        high: "bg-red-500/10 text-red-500"

    }

    return (

        <span
            className={`
px-3
py-1
rounded-full
text-xs
font-semibold
${colors[type]}
`}
        >

            {type}

        </span>

    )

}