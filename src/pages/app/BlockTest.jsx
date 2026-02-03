import { useState, useMemo, useEffect } from "react";
import { COLORS } from "../../theme/colors";
import muizzaLike from "../../assets/images/muizza_think.png";

/*
  BlockTest — ТОЛЬКО UI
  ❌ нет кнопки
  ❌ нет sendTestAnswer
  ✅ отдает payload наверх
*/

export default function BlockTest({
                                      question,
                                      answerLocked,
                                      lastResult,
                                      onChange,
                                  }) {
    const [selectedKey, setSelectedKey] = useState(null);
    const [matchPairs, setMatchPairs] = useState({});

    /* ---------- AVAILABLE OPTIONS (MATCH) ---------- */

    const availableOptions = useMemo(() => {
        if (question.type !== "MATCH") return [];

        const usedValues = Object.values(matchPairs);
        return question.items.filter(
            (it) => !usedValues.includes(it.value)
        );
    }, [question, matchPairs]);

    /* ---------- MATCH ---------- */

    function handleSelect(leftKey, value) {
        if (answerLocked) return;

        setMatchPairs((prev) => {
            const next = { ...prev };

            // убираем value, если оно уже использовалось
            Object.keys(next).forEach((k) => {
                if (next[k] === value) delete next[k];
            });

            if (value) next[leftKey] = value;
            else delete next[leftKey];

            return next;
        });
    }

    /* ---------- SYNC WITH PARENT ---------- */

    useEffect(() => {
        if (question.type === "MATCH") {
            onChange({
                ready:
                    Object.keys(matchPairs).length === question.items.length,
                payload: matchPairs,
            });
            return;
        }

        if (selectedKey) {
            const item = question.items.find(
                (i) => i.key === selectedKey
            );
            if (item) {
                onChange({
                    ready: true,
                    payload: { [item.key]: item.value },
                });
            }
        } else {
            onChange({ ready: false, payload: null });
        }
    }, [selectedKey, matchPairs, question, onChange]);

    /* ---------- RENDERS ---------- */

    function renderSingleChoice() {
        return (
            <div className="mt-5 space-y-3">
                {question.items.map((it) => {
                    const active = selectedKey === it.key;

                    return (
                        <button
                            key={it.key}
                            onClick={() => setSelectedKey(it.key)}
                            disabled={answerLocked}
                            className="w-full text-left rounded-[22px] px-4 py-4 font-extrabold border flex items-center gap-3"
                            style={{
                                background: active
                                    ? "rgba(47,124,200,0.12)"
                                    : "rgba(255,255,255,0.75)",
                                borderColor: active
                                    ? "#2F7CC8"
                                    : "rgba(255,255,255,0.7)",
                            }}
                        >
                            <div className="w-[36px] h-[36px] rounded-full bg-blue-100 flex items-center justify-center font-black">
                                {it.key}
                            </div>
                            {it.value}
                        </button>
                    );
                })}
            </div>
        );
    }

    function renderTrueFalse() {
        return (
            <div className="mt-5 grid grid-cols-2 gap-3">
                {question.items.map((it) => {
                    const active = selectedKey === it.key;

                    return (
                        <button
                            key={it.key}
                            onClick={() => setSelectedKey(it.key)}
                            disabled={answerLocked}
                            className="rounded-[24px] px-4 py-5 font-black"
                            style={{
                                background: active
                                    ? "rgba(56,189,248,0.18)"
                                    : "rgba(255,255,255,0.78)",
                            }}
                        >
                            {it.value}
                        </button>
                    );
                })}
            </div>
        );
    }

    function renderMatch() {
        return (
            <div className="mt-5 space-y-4">
                {question.items.map((it) => {
                    const selectedValue = matchPairs[it.key] || "";

                    return (
                        <div
                            key={it.key}
                            className="flex gap-3 items-center"
                        >
                            {/* LEFT — KEY (50%) */}
                            <div className="w-1/2 h-[56px] rounded-[18px] bg-blue-100 flex items-center justify-center font-black text-center px-2">
                                {it.key}
                            </div>

                            {/* RIGHT — SELECT (50%) */}
                            <select
                                value={selectedValue}
                                disabled={answerLocked}
                                onChange={(e) =>
                                    handleSelect(it.key, e.target.value)
                                }
                                className="w-1/2 h-[56px] rounded-[18px] border px-4 font-bold bg-white"
                            >
                                <option value="">
                                    Выберите значение
                                </option>

                                {selectedValue && (
                                    <option value={selectedValue}>
                                        {selectedValue}
                                    </option>
                                )}

                                {availableOptions.map((opt) => (
                                    <option
                                        key={opt.key}
                                        value={opt.value}
                                    >
                                        {opt.value}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                })}
            </div>
        );
    }

    /* ---------- UI ---------- */

    return (
        <div className="relative">
            {/* CAT */}
            <div className="flex justify-center mb-[-7px] pointer-events-none">
                <img src={muizzaLike} className="w-[180px]" />
            </div>

            <div className="rounded-[34px] bg-white px-6 py-6 shadow-xl">
                {/* MEDIA IMAGE FROM BACK */}
                {question.mediaUrl && (
                    <div className="mb-4 flex justify-center">
                        <img
                            src={question.mediaUrl}
                            alt="question media"
                            className="
                    max-h-[180px]
                    w-full
                    object-contain
                    rounded-[18px]
                    shadow-[0_10px_30px_rgba(0,0,0,0.12)]
                "
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    </div>
                )}

                {/* QUESTION TEXT */}
                <div
                    className="text-[22px] font-black mb-3"
                    style={{ color: COLORS.brand.titleBlue }}
                >
                    {question.text}
                </div>



                {question.type === "SINGLE_CHOICE" && renderSingleChoice()}
                {question.type === "TRUE_FALSE" && renderTrueFalse()}
                {question.type === "MATCH" && renderMatch()}

                {lastResult !== null && (
                    <div className="mt-4 font-black text-center">
                        {lastResult ? "✅ Правильно!" : "❌ Неправильно"}
                    </div>
                )}
            </div>
        </div>
    );
}
