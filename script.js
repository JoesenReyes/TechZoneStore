/******************************************************
 * TECHZONE STORE
 * FRONTEND JAVASCRIPT
 ******************************************************/

/*
========================================================
GOOGLE APPS SCRIPT WEB APP URL
========================================================
*/

const APP_URL =
    "https://script.google.com/macros/s/AKfycbzIZamJvTQdXDaKsSzaIIcBh_arDRfsBI671kA3cSKXnIDQ4JfFNIGEwPV_Oq2ePU_XtA/exec";


/*
========================================================
GLOBAL VARIABLES
========================================================
*/

let currentUser = "";
let currentRole = "";

let products = [];
let categories = [];
let users = [];
let activityLogs = [];
let deletedProducts = [];

let pendingAction = null;
let pendingActionData = null;


/*
========================================================
API CONNECTION
========================================================
*/

async function api(action, data = {}) {

    if (
        !APP_URL ||
        APP_URL === "PASTE_YOUR_WEB_APP_URL_HERE"
    ) {

        throw new Error(
            "Apps Script URL is not configured."
        );

    }


    const controller =
        new AbortController();


    const timeoutId =
        setTimeout(
            function() {

                controller.abort();

            },
            30000
        );


    try {

        const response =
            await fetch(
                APP_URL,
                {

                    method: "POST",

                    redirect: "follow",

                    cache: "no-store",

                    signal:
                        controller.signal,

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            action:
                                action,

                            ...data

                        })

                }
            );


        const text =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(
                    text
                );

        } catch (parseError) {

            console.error(
                "Apps Script returned:",
                text
            );


            throw new Error(
                "Apps Script returned an invalid response. " +
                "Please check your deployment."
            );

        }


        if (!response.ok) {

            throw new Error(

                result.message ||

                "Server error. HTTP " +

                response.status

            );

        }


        return result;


    } catch (error) {

        console.error(
            "Apps Script connection error:",
            error
        );


        if (
            error.name ===
            "AbortError"
        ) {

            throw new Error(
                "Connection timed out. " +
                "Please check your internet connection " +
                "and try again."
            );

        }


        if (
            error instanceof TypeError
        ) {

            throw new Error(
                "Unable to reach Google Apps Script. " +
                "Please check your internet connection " +
                "or Apps Script deployment."
            );

        }


        throw error;


    } finally {

        clearTimeout(
            timeoutId
        );

    }

}


/*
========================================================
MESSAGE
========================================================
*/

function showMessage(
    text,
    success = false
) {

    const message =
        document.getElementById(
            "message"
        );


    if (!message) {

        return;

    }


    message.textContent =
        text;


    message.style.color =
        success
            ? "#16803c"
            : "#d9363e";

}


/*
========================================================
STARTUP
========================================================
*/

window.addEventListener(
    "DOMContentLoaded",

    function() {

        console.log(
            "TechZone Store frontend loaded."
        );


        console.log(
            "Connected Apps Script URL:",
            APP_URL
        );

    }

);
