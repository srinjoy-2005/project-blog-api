// backend validation of sign up

const SECRET_CODE = 123456;

function validateSignupData(data) {
    const { username, fullname, password, confirmPassword, memcode } = data;
    const errors = [];
    let membershipStatus = 0;

    const sanitizedUsername = username?.trim();
    const sanitizedFullname = fullname?.trim();

    if (!sanitizedUsername || !sanitizedFullname || !password || !confirmPassword) {
        errors.push("All standard fields are required.");
        return { isValid: false, errors, dbData: null };
    }

    if (password !== confirmPassword) {
        errors.push("Passwords do not match.");
    }

    if (password.length < 6) {
        errors.push("Password must be at least 6 characters long.");
    }

    if (memcode && Number(memcode) === SECRET_CODE) {
        membershipStatus = 1;
    } else if (memcode) {
        errors.push("Invalid member code.");
    }
    //else membershipstatus remains 0

    return {
        isValid: errors.length === 0,
        errors,
        dbData: errors.length === 0 ? {
            username: sanitizedUsername,
            fullname: sanitizedFullname,
            rawPassword: password,
            membership: membershipStatus
        } : null
    };
}

module.exports = { validateSignupData };