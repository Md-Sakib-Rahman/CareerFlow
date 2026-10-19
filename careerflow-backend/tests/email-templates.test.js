const { generateEmailHtml } = require("../src/utils/emailTemplates");

test("S21: company with <script> is escaped", () => {
  const html = generateEmailHtml("Sam", "Dev", "<script>alert(1)</script>", "1/1/2030", "interview");
  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
});

test("S21: name and title are escaped", () => {
  const html = generateEmailHtml('<img src=x onerror=1>', '"><b>t</b>', "Acme", "1/1/2030", "apply");
  expect(html).not.toContain("<img");
  expect(html).not.toContain("<b>t</b>");
});
