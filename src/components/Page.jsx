import { motion } from "framer-motion";

export default function Page({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35 }}
        >
            {children}
        </motion.div>
    );
}
