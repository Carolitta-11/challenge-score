// ==========================================
// SUPABASE CONFIGURATION
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

const leaderboard =
    document.getElementById("leaderboard");

const playerCount =
    document.getElementById("playerCount");

const lastUpdate =
    document.getElementById("lastUpdate");


// ==========================================
// LOAD PLAYERS
// ==========================================

async function loadPlayers() {

    const { data, error } = await supabaseClient
        .from("players")
        .select("id, name, score")
        .order("score", {
            ascending: false
        });

    if (error) {

        console.error("Supabase error:", error);

        leaderboard.innerHTML = `
            <div class="error">
                ⚠️
                <br><br>
                Couldn't load the leaderboard.
                <br>
                Please try again.
            </div>
        `;

        return;
    }

    renderLeaderboard(data);
}


// ==========================================
// RENDER LEADERBOARD
// ==========================================

function renderLeaderboard(players) {

    playerCount.textContent = players.length;

    if (!players.length) {

        leaderboard.innerHTML = `
            <div class="loading">
                No players found.
            </div>
        `;

        return;
    }


    leaderboard.innerHTML = players
        .map((player, index) => {

            const rank =
                index + 1;

            let rankDisplay =
                String(rank).padStart(2, "0");

            if (rank === 1) {
                rankDisplay = "🥇";
            }

            else if (rank === 2) {
                rankDisplay = "🥈";
            }

            else if (rank === 3) {
                rankDisplay = "🥉";
            }


            return `
                <article
                    class="player-card rank-${rank}"
                >

                    <div class="rank">
                        ${rankDisplay}
                    </div>


                    <div class="player-info">

                        <div class="player-name">
                            ${escapeHTML(player.name)}
                        </div>

                    </div>


                    <div class="score">

                        ${player.score}

                        <span class="score-label">
                            XP
                        </span>

                    </div>

                </article>
            `;

        })
        .join("");


    updateTime();
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
// UPDATE TIME
// ==========================================

function updateTime() {

    const now =
        new Date();

    lastUpdate.textContent =
        now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
}


// ==========================================
// AUTO REFRESH
// ==========================================

// Update the leaderboard every 3 seconds.

setInterval(
    loadPlayers,
    3000
);


// ==========================================
// INITIAL LOAD
// ==========================================

loadPlayers();
