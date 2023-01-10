var code = window.location.href.split("?code=")[1] ?? 'not available';
        document.getElementById("code-spot").innerHTML = code;