function matchItem(item, logic) {
    // Base case: if the key is not "and" or "or"
    if (typeof logic !== 'object' || Array.isArray(logic)) {
        for (const key in logic) {
            if (logic.hasOwnProperty(key) && item[key] !== logic[key]) {
                return false;
            }
        }
        return true;
    }

    // Recursive cases
    for (const key in logic) {
        if (logic.hasOwnProperty(key)) {
            const conditions = logic[key];
            if (key === 'or') {
                return conditions.some(condition => matchItem(item, condition));
            } else if (key === 'and') {
                return conditions.every(condition => matchItem(item, condition));
            }
        }
    }
    return false;
}

function filterItems(items, logic) {
    return items.filter(item => matchItem(item, logic));
}
