const rolesData = {
    "roles": [
      {
        "name": "Requestor",
        "elementsToShow": [".requestor-btn", ".requestor"],
        "elementsToHide": [".creator-btn", ".creator", ".supervisor", ".end-user", ".superuser", ".admin"]
      },
      {
        "name": "Creator",
        "elementsToShow": [".creator-btn", ".creator"],
        "elementsToHide": [".requestor-btn", ".requestor", ".supervisor", ".end-user", ".superuser", ".admin"]
      },
      {
        "name": "Supervisor",
        "elementsToShow": [".supervisor-btn", ".supervisor"],
        "elementsToHide": [".requestor-btn", ".requestor", ".creator", ".end-user", ".superuser", ".admin"]
      },
      {
        "name": "End user Approval",
        "elementsToShow": [".end-user-approval-btn", ".end-user"],
        "elementsToHide": [".approval-btn", ".requestor", ".creator", ".supervisor", ".superuser", ".admin"]
      },
      {
        "name": "Superuser (Functional)",
        "elementsToShow": [".superuser-btn", ".superuser"],
        "elementsToHide": [".admin-btn", ".requestor", ".creator", ".supervisor", ".end-user", ".end-user", ".admin"]
      },
      {
        "name": "Admin (Technical)",
        "elementsToShow": [".admin-btn", ".admin"],
        "elementsToHide": [".superuser-btn", ".requestor", ".creator", ".supervisor", ".end-user", ".superuser"]
      }
    ]
  };

// Function to set a cookie with name, value, and expiration (in days)
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Cookie expiration in days
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
    console.log("Cookie Set: ", document.cookie); // Debugging: Check cookie contents
}

// Function to retrieve a cookie by name
function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie); // Decode cookie string
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let c = cookieArray[i].trim();
        if (c.indexOf(cname) === 0) {
            console.log("Cookie Found: ", c.substring(cname.length)); // Debugging: Log cookie found
            return c.substring(cname.length);
        }
    }
    return ""; // Return empty if cookie not found
}


  // Function to show/hide elements based on the selected role
  function applyRoleVisibility(role) {
    const selectedRole = rolesData.roles.find(r => r.name === role);
    if (selectedRole) {
      // Hide elements
      selectedRole.elementsToHide.forEach(selector => {
        $(selector).hide();
      });
      // Show elements
      selectedRole.elementsToShow.forEach(selector => {
        $(selector).show();
      });
    }
  }

  // On role change, show/hide elements and save role in cookie
  $('#roleDropdown').on('change', function () {
    const selectedRole = $(this).val();
    console.log("Dropdown Changed: ", selectedRole); // Debugging: Log role change
    applyRoleVisibility(selectedRole);
    setCookie('selectedRole', selectedRole, 7); // Save for 7 days
    window.location.href = '/';
  });

  // On page load, check for saved role in cookie and apply visibility
  $(document).ready(function () {
    const savedRole = getCookie('selectedRole');
    if (savedRole) {
      console.log("Applying Saved Role: ", savedRole); // Debugging: Log role being applied
      $('#roleDropdown').val(savedRole); // Set dropdown value to saved role
      applyRoleVisibility(savedRole);    // Apply visibility for saved role
    } else {
      console.log("No Saved Role Found, Applying Default");
      const defaultRole = $('#roleDropdown').val(); // Get current default dropdown value
      applyRoleVisibility(defaultRole);             // Apply visibility for the default role
    }
  })


// Function to set the active item in the menu and store it in cookies
function setActiveMenuItem() {
  // Add click event to each nav-link
  const navLinks = document.querySelectorAll('.nav-item .nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();  // Prevent default anchor behavior

      // Remove 'active' class from all nav items
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
      });

      // Add 'active' class to the clicked nav item
      this.parentElement.classList.add('active');

      // Save the active link in cookies
      const pagePath = this.getAttribute('href');
      document.cookie = "activeNavItem=" + pagePath + "; path=/";  // Store the href in cookies
      window.location.href = pagePath;  // Redirect to the page
    });
  });
}

// Function to restore the active item from cookies after page reload
function restoreActiveMenuItem() {
  const cookies = document.cookie.split(';').reduce((cookieObj, cookieStr) => {
    const [key, value] = cookieStr.trim().split('=');
    cookieObj[key] = value;
    return cookieObj;
  }, {});

  const activePage = cookies.activeNavItem;
  
  if (activePage) {
    const activeLink = document.querySelector(`.nav-item .nav-link[href='${activePage}']`);
    if (activeLink) {
      // Add 'active' class to the corresponding nav item
      activeLink.parentElement.classList.add('active');
    }
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', function() {
  setActiveMenuItem();
  restoreActiveMenuItem();
});
