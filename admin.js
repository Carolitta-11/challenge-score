// ==========================================
// SUPABASE CONFIG
// ==========================================

const SUPABASE_URL =
    "https://zjwaaovkhizlgcwggsvv.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Rc9uF7suSkEv6ji2l2mUCA_JjshZHw6";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// ELEMENTS
// ==========================================

const loginSection =
    document.getElementById("loginSection");

const adminPanel =
    document.getElementById("adminPanel");

const loginButton =
    document.getElementById("loginButton");

const logoutButton =
    document.getElementById("logoutButton");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginMessage =
    document.getElementById("loginMessage");

const adminPlayers =
    document.getElementById("adminPlayers");


// ==========================================
// LOGIN
// ==========================================

loginButton.addEventListener(
    "click",
    login
);


async function login() {

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        showLoginMessage(
            "Please enter email and password.",
            "error"
        );

        return;
    }


    loginButton.disabled = true;

    loginButton.textContent =
        "LOGGING IN...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });


    loginButton.disabled = false;

    loginButton.textContent =
        "LOGIN";


    if (error) {

        console.error(error);

        showLoginMessage(
            "Login failed. Check your email and password.",
            "error"
        );

        return;
    }


    // The RLS policy in your database
    // determines whether this account
    // is allowed to update players.

    showAdminPanel();
}


// ==========================================
// SHOW ADMIN PANEL
// ==========================================

async function showAdminPanel() {

    loginSection.style.display =
        "none";

    adminPanel.classList.add(
        "visible"
    );

    await loadPlayers();
}


// ==========================================
// LOAD PLAYERS
// ==========================================

async function loadPlayers() {

    adminPlayers.innerHTML = `
        <div class="loading">
            <div class="loader"></div>
            Loading players...
        </div>
    `;


    const { data, error } =
        await supabaseClient
            .from("players")
            .select("id, name, score")
            .order("score", {
                ascending: false
            });


    if (error) {

        console.error(error);

        adminPlayers.innerHTML = `
            <div class="message error">
                Could not load players.
                <br><br>
                ${escapeHTML(error.message)}
            </div>
        `;

        return;
    }


    renderPlayers(data);
}


// ==========================================
// RENDER ADMIN PLAYERS
// ==========================================

function renderPlayers(players) {

    adminPlayers.innerHTML =
        players.map(player => {

            return `
                <div
                    class="admin-player"
                    data-id="${player.id}"
                >

                    <div class="player-row">

                        <input
                            class="admin-player-name"
                            value="${escapeHTML(player.name)}"
                            data-name-id="${player.id}"
                        >

                        <div class="admin-score">
                            ${player.score}
                            <small>XP</small>
                        </div>

                    </div>


                    <button
                        class="save-name"
                        onclick="saveName(${player.id})"
                    >
                        SAVE NAME
                    </button>


                    <div class="score-buttons">

                        <button
                            class="score-btn minus"
                            onclick="changeScore(${player.id}, -20)"
                        >
                            -20
                        </button>

                        <button
                            class="score-btn minus"
                            onclick="changeScore(${player.id}, -10)"
                        >
                            -10
                        </button>

                        <button
                            class="score-btn"
                            onclick="changeScore(${player.id}, -5)"
                        >
                            -5
                        </button>

                        <button
                            class="score-btn plus"
                            onclick="changeScore(${player.id}, 5)"
                        >
                            +5
                        </button>

                        <button
                            class="score-btn plus"
                            onclick="changeScore(${player.id}, 10)"
                        >
                            +10
                        </button>

                    </div>


                    <div class="score-buttons">

                        <button
                            class="score-btn plus"
                            onclick="changeScore(${player.id}, 20)"
                        >
                            +20
                        </button>

                        <button
                            class="score-btn plus"
                            onclick="changeScore(${player.id}, 50)"
                        >
                            +50
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


// ==========================================
// CHANGE SCORE
// ==========================================

async function changeScore(
    playerId,
    amount
) {

    const { data: player, error: fetchError } =
        await supabaseClient
            .from("players")
            .select("score")
            .eq("id", playerId)
            .single();


    if (fetchError) {

        alert(
            "Couldn't get current score."
        );

        console.error(fetchError);

        return;
    }


    const currentScore =
        Number(player.score) || 0;


    const newScore =
        Math.max(
            0,
            currentScore + amount
        );


    const { error: updateError } =
        await supabaseClient
            .from("players")
            .update({
                score: newScore
            })
            .eq("id", playerId);


    if (updateError) {

        console.error(updateError);

        alert(
            "Update failed:\n\n" +
            updateError.message
        );

        return;
    }


    await loadPlayers();
}


// ==========================================
// SAVE PLAYER NAME
// ==========================================

async function saveName(playerId) {

    const input =
        document.querySelector(
            `[data-name-id="${playerId}"]`
        );


    if (!input) {
        return;
    }


    const newName =
        input.value.trim();


    if (!newName) {

        alert(
            "Player name cannot be empty."
        );

        return;
    }


    const { error } =
        await supabaseClient
            .from("players")
            .update({
                name: newName
            })
            .eq("id", playerId);


    if (error) {

        console.error(error);

        alert(
            "Could not save name:\n\n" +
            error.message
        );

        return;
    }


    await loadPlayers();
}


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener(
    "click",
    async () => {

        await supabaseClient.auth.signOut();

        adminPanel.classList.remove(
            "visible"
        );

        loginSection.style.display =
            "block";

        passwordInput.value = "";

    }
);


// ==========================================
// CHECK EXISTING SESSION
// ==========================================

async function checkSession() {

    const {
        data: {
            session
        }
    } =
        await supabaseClient.auth.getSession();


    if (session) {

        showAdminPanel();

    }

}


// ==========================================
// LOGIN MESSAGE
// ==========================================

function showLoginMessage(
    message,
    type
) {

    loginMessage.textContent =
        message;

    loginMessage.className =
        `message ${type}`;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ==========================================
// START
// ==========================================

checkSession();
