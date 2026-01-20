import { COLORS } from "../../theme/colors";

export function getLessonCardUi(status) {
    if (status === "ACTIVE") {
        return {
            wrapStyle: {
                background: `linear-gradient(to bottom, ${COLORS.lesson.activeTop}, ${COLORS.lesson.activeBottom})`,
            },
            shadowClass:
                "shadow-[0_18px_0_rgba(0,0,0,0.18),0_40px_70px_rgba(0,0,0,0.18)]",
        };
    }

    if (status === "COMPLETED") {
        return {
            wrapStyle: {
                background: `linear-gradient(to bottom, ${COLORS.lesson.completedTop}, ${COLORS.lesson.completedBottom})`,
            },
            shadowClass:
                "shadow-[0_18px_0_rgba(0,0,0,0.18),0_40px_70px_rgba(0,0,0,0.18)]",
        };
    }

    // LOCKED
    return {
        wrapStyle: {
            background: `linear-gradient(to bottom, ${COLORS.lesson.lockedTop}, ${COLORS.lesson.lockedBottom})`,
        },
        shadowClass:
            "shadow-[0_18px_0_rgba(0,0,0,0.16),0_40px_70px_rgba(0,0,0,0.14)]",
    };
}
