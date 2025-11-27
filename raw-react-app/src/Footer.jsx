import React from "react";

function Footer() {
  return (
    <footer>
        <div className="contacts">
            <span><img src="assets/email.svg" alt="Phone Icon" /><a href="mailto:kris@feit.uniza.sk">kris@feit.uniza.sk</a></span>
            <span><img src="assets/phone.svg" alt="Phone Icon" /><a href="tel:+421415133301">+421 41 513 3301</a></span>
        </div>
      <p>&copy; {new Date().getFullYear()} UNIZA-Tweets</p>
    </footer>
  );
}

export default Footer;