import emailjs from "@emailjs/browser";

// Initialize EmailJS with your public key
emailjs.init("XChalksC-6gQ4oIVa");

/**
 * Generate company email from employee name
 * Format: firstname.lastname@rent-a-click.com
 */
export const generateCompanyEmail = (firstName, lastName) => {
  const cleanFirstName = firstName.toLowerCase().trim().replace(/\s+/g, "");
  const cleanLastName = lastName.toLowerCase().trim().replace(/\s+/g, "");
  return `${cleanFirstName}.${cleanLastName}@rent-a-click.com`;
};

/**
 * Send employee credentials via email
 */
export const sendEmployeeCredentials = async (
  employeeData,
  temporaryPassword,
  roleName
) => {
  try {
    // Generate company email for login
    const companyEmail = generateCompanyEmail(
      employeeData.firstName,
      employeeData.lastName
    );

    // Get login URL (works in both dev and production)
    const loginUrl = `${window.location.origin}/login`;

    const templateParams = {
      to_email: employeeData.email, // Personal Gmail where email will be sent
      to_name: `${employeeData.firstName} ${employeeData.lastName}`,
      employee_id: employeeData.employeeId,
      email: companyEmail, // Company email for login
      temporary_password: temporaryPassword,
      role: roleName,
      login_url: loginUrl,
      company_name: "RENT-A-CLICK",
    };

    console.log("📧 Sending credentials email to:", employeeData.email);
    console.log("📧 Template params:", templateParams);

    const response = await emailjs.send(
      "service_88ok97d",
      "template_sdu6jjp", // CORRECTED TEMPLATE ID
      templateParams,
      "XChalksC-6gQ4oIVa"
    );

    console.log("✅ Email sent successfully:", response);
    return { success: true, response };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return { success: false, error };
  }
};
