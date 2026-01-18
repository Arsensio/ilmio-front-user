import { httpClient } from "../http/httpClient";

/**
 * Проверка существования USERNAME/EMAIL
 * true  -> уже существует
 * false -> свободно
 *
 * POST /auth/account/contains?accountField=USERNAME
 * body: { "account": "arsensio" }
 */
export async function containsAccountField({ accountField, account, signal }) {
    const res = await httpClient.post(
        `/auth/account/contains`,
        { account },
        {
            params: { accountField },
            signal,
        }
    );

    return res.data; // boolean
}
