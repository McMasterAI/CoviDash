document.getElementById("demo").addEventListener("click", myFunction);
            
function myFunction() {
  document.getElementById("demo").innerHTML = "Passed from python: {{content}}";
}

