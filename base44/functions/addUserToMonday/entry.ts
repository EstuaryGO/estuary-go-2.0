import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BOARD_ID = 18397802948;

async function mondayRequest(query) {
    const response = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("MONDAY_API_KEY")}`,
            "API-Version": "2023-10"
        },
        body: JSON.stringify({ query })
    });
    return response.json();
}

Deno.serve(async (req) => {
    try {
        const client = createClientFromRequest(req);
        await client.auth.me(); // throws if unauthenticated

        const payload = await req.json();

        // Debug: return board columns
        if (payload._debug_columns) {
            const result = await mondayRequest(`{ boards(ids: [${BOARD_ID}]) { columns { id title } } }`);
            return Response.json(result);
        }

        // Support both direct calls ({ email, full_name }) and entity automation calls ({ data: { email, full_name } })
        const userData = payload.data || payload;
        const email = userData.email;
        const full_name = userData.full_name;

        if (!email) {
            return Response.json({ error: "No email provided" }, { status: 400 });
        }

        const itemName = full_name || email;

        // Check if item with this email already exists
        const searchResult = await mondayRequest(`{ items_page_by_column_values(board_id: ${BOARD_ID}, columns: [{column_id: "contact_email", column_values: [${JSON.stringify(email)}]}]) { items { id name } } }`);
        const existing = searchResult.data?.items_page_by_column_values?.items;
        if (existing && existing.length > 0) {
            console.log("User already exists in Monday.com:", existing[0].id);
            return Response.json({ success: true, itemId: existing[0].id, existing: true });
        }

        const query = `
            mutation {
                create_item(
                    board_id: ${BOARD_ID},
                    item_name: ${JSON.stringify(itemName)},
                    column_values: ${JSON.stringify(JSON.stringify({ boolean_mm2c4j5w: { checked: true }, contact_email: { email: email, text: email } }))}
                ) {
                    id
                    name
                }
            }
        `;

        const result = await mondayRequest(query);

        if (result.errors) {
            console.error("Monday.com error:", JSON.stringify(result.errors));
            return Response.json({ error: result.errors }, { status: 500 });
        }

        console.log("User added to Monday.com:", result.data?.create_item?.id, "name:", itemName);
        return Response.json({ success: true, itemId: result.data?.create_item?.id });
    } catch (error) {
        console.error("Error:", error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});