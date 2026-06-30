export function Card({ className = "", children }) {

    return (

        <div
            className={`

rounded-2xl
p-6

bg-white
dark:bg-slate-800

border
border-slate-200
dark:border-slate-700

shadow-card

backdrop-blur-md

transition
hover:shadow-lg

${className}

`}
        >

            {children}

        </div>

    )

}

export function CardTitle({ children }) {

    return (

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">

            {children}

        </h2>

    )

}

export function CardSub({ children }) {

    return (

        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">

            {children}

        </div>

    )

}