const emailInput = document.getElementById("emailInput");
const checkBtn = document.getElementById("checkBtn");
const result = document.getElementById("result");


// ==========================================
// COMMON EMAIL DOMAINS
// ==========================================

const trustedDomains = [
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "yahoo.com",
    "icloud.com",
    "proton.me",
    "protonmail.com"
];


// ==========================================
// TEMPORARY / DISPOSABLE EMAIL DOMAINS
// ==========================================

const temporaryDomains = [
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "yopmail.com",
    "temp-mail.org"
];


// ==========================================
// CHECK BUTTON
// ==========================================

checkBtn.addEventListener("click", function () {

    const email = emailInput.value.trim().toLowerCase();

    let problems = [];
    let score = 0;


    // ======================================
    // 1. EMPTY EMAIL CHECK
    // ======================================

    if (email === "") {

        result.innerHTML = `
            <h2>Please enter an email address.</h2>
        `;

        return;
    }


    // ======================================
    // 2. @ SYMBOL CHECK
    // ======================================

    const atCount = (email.match(/@/g) || []).length;

    if (atCount !== 1) {

        problems.push(
            "Email must contain exactly one @ symbol."
        );

        score += 30;
    }


    // ======================================
    // 3. BASIC EMAIL FORMAT CHECK
    // ======================================

    const emailPattern =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;

    if (!emailPattern.test(email)) {

        problems.push(
            "Invalid email format."
        );

        score += 25;
    }


    // ======================================
    // STOP IF @ IS NOT CORRECT
    // ======================================

    if (atCount !== 1) {

        showResult(email, score, problems);

        return;
    }


    // ======================================
    // 4. SPLIT EMAIL
    // ======================================

    const parts = email.split("@");

    const username = parts[0];
    const domain = parts[1];


    // ======================================
    // 5. USERNAME CHECK
    // ======================================

    if (username.length === 0) {

        problems.push(
            "Username is missing."
        );

        score += 20;
    }


    // Username starts or ends with dot

    if (
        username.startsWith(".") ||
        username.endsWith(".")
    ) {

        problems.push(
            "Username cannot start or end with a dot."
        );

        score += 15;
    }


    // Consecutive dots

    if (username.includes("..")) {

        problems.push(
            "Username contains consecutive dots."
        );

        score += 15;
    }


    // ======================================
    // 6. DOMAIN CHECK
    // ======================================

    if (
        domain.startsWith("-") ||
        domain.endsWith("-")
    ) {

        problems.push(
            "Domain contains an invalid hyphen."
        );

        score += 15;
    }


    // Consecutive dots in domain

    if (domain.includes("..")) {

        problems.push(
            "Domain contains consecutive dots."
        );

        score += 15;
    }


    // ======================================
    // 7. TEMPORARY EMAIL CHECK
    // ======================================

    if (temporaryDomains.includes(domain)) {

        problems.push(
            "Temporary or disposable email domain detected."
        );

        score += 60;
    }


    // ======================================
    // 8. TRUSTED DOMAIN CHECK
    // ======================================

    if (trustedDomains.includes(domain)) {

        problems.push(
            "Domain belongs to a commonly used email provider."
        );

        score -= 10;
    }


    // ======================================
    // 9. TYPO DETECTION
    // ======================================

    if (!trustedDomains.includes(domain)) {

        const closest = findClosestDomain(domain);

        if (closest.distance <= 2) {

            problems.push(
                `Possible typo detected. Did you mean ${closest.domain}?`
            );

            score += 45;
        }
    }


    // ======================================
    // KEEP SCORE BETWEEN 0 AND 100
    // ======================================

    score = Math.max(
        0,
        Math.min(100, score)
    );


    // ======================================
    // SHOW FINAL RESULT
    // ======================================

    showResult(
        email,
        score,
        problems
    );

});


// ==========================================
// FIND CLOSEST DOMAIN
// ==========================================

function findClosestDomain(domain) {

    let closestDomain = null;

    let smallestDistance = Infinity;


    trustedDomains.forEach(function (commonDomain) {

        const distance = levenshteinDistance(
            domain,
            commonDomain
        );


        if (distance < smallestDistance) {

            smallestDistance = distance;

            closestDomain = commonDomain;
        }

    });


    return {
        domain: closestDomain,
        distance: smallestDistance
    };
}


// ==========================================
// LEVENSHTEIN DISTANCE
// ==========================================

function levenshteinDistance(a, b) {

    const matrix = [];


    // First column

    for (let i = 0; i <= b.length; i++) {

        matrix[i] = [i];

    }


    // First row

    for (let j = 0; j <= a.length; j++) {

        matrix[0][j] = j;

    }


    // Compare characters

    for (let i = 1; i <= b.length; i++) {

        for (let j = 1; j <= a.length; j++) {

            if (
                b.charAt(i - 1) ===
                a.charAt(j - 1)
            ) {

                matrix[i][j] =
                    matrix[i - 1][j - 1];

            } else {

                matrix[i][j] = Math.min(

                    matrix[i - 1][j - 1] + 1,

                    matrix[i][j - 1] + 1,

                    matrix[i - 1][j] + 1

                );

            }

        }

    }


    return matrix[b.length][a.length];
}


// ==========================================
// SHOW RESULT
// ==========================================

function showResult(email, score, problems) {

    let status;
    let message;


    // ======================================
    // RISK LEVEL
    // ======================================

    if (score >= 70) {

        status = "HIGH RISK";

        message =
            "This email looks highly suspicious.";

    }

    else if (score >= 40) {

        status = "SUSPICIOUS";

        message =
            "This email has some suspicious characteristics.";

    }

    else {

        status = "LOW RISK";

        message =
            "No major suspicious pattern was detected.";

    }


    // ======================================
    // PROBLEM LIST
    // ======================================

    let problemHTML = "";


    if (problems.length === 0) {

        problemHTML =
            "<li>No major problems detected.</li>";

    }

    else {

        problems.forEach(function (problem) {

            problemHTML +=
                `<li>${problem}</li>`;

        });

    }


    // ======================================
    // DISPLAY REPORT
    // ======================================

    result.innerHTML = `

        <h2>${status}</h2>

        <p>${message}</p>

        <p>
            <strong>Email:</strong>
            ${email}
        </p>

        <p>
            <strong>Risk Score:</strong>
            ${score}/100
        </p>

        <h3>Detection Report</h3>

        <ul>
            ${problemHTML}
        </ul>

    `;
}