// Vazifalardan bildirishnomalarni hisoblash (muddati o'tgan + tez orada)

export function computeNotifications(tasks = []) {
    const now = new Date();
    const soonLimit = new Date();
    soonLimit.setDate(soonLimit.getDate() + 3);

    const overdue = [];
    const soon = [];

    for (const task of tasks) {
        if (task.completed || !task.deadline) continue;
        const d = new Date(task.deadline);
        if (d < now) {
            overdue.push(task);
        } else if (d <= soonLimit) {
            soon.push(task);
        }
    }

    const byDate = (a, b) => new Date(a.deadline) - new Date(b.deadline);
    overdue.sort(byDate);
    soon.sort(byDate);

    return { overdue, soon, count: overdue.length + soon.length };
}
