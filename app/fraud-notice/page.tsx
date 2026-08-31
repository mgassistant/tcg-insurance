import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applicant Fraud Notice | TCG Insurance",
  description:
    "State-by-state applicant fraud notices for trading card dealer and collector insurance applications submitted through BetterHelp Insurance.",
};

const NOTICES: { state: string; text: string }[] = [
  {
    state: "All applicants (states other than those listed below)",
    text: "Any person who knowingly and willfully presents false information in an application for insurance may be guilty of insurance fraud and subject to fines and confinement in prison.",
  },
  {
    state: "Arkansas",
    text: "Any person who knowingly presents a false or fraudulent claim for payment of a loss or benefit or knowingly presents false information in an application for insurance is guilty of a crime and may be subject to fines and confinement in prison.",
  },
  {
    state: "Colorado",
    text: "It is unlawful to knowingly provide false, incomplete, or misleading facts or information to an insurance company for the purpose of defrauding or attempting to defraud the company. Penalties may include imprisonment, fines, denial of insurance and civil damages. Any insurance company or agent of an insurance company who knowingly provides false, incomplete, or misleading facts or information to a policyholder or claimant for the purpose of defrauding or attempting to defraud the policyholder or claimant with regard to a settlement or award payable from insurance proceeds shall be reported to the Colorado Division of Insurance within the Department of Regulatory Agencies.",
  },
  {
    state: "District of Columbia",
    text: "WARNING: It is a crime to provide false or misleading information to an insurer for the purpose of defrauding the insurer or any other person. Penalties include imprisonment and/or fines. In addition, an insurer may deny insurance benefits if false information materially related to a claim was provided by the applicant.",
  },
  {
    state: "Florida",
    text: "Any person who knowingly and with intent to injure, defraud, or deceive any insurance company files a statement of claim or an application containing any false, incomplete, or misleading information is guilty of a felony of the third degree.",
  },
  {
    state: "Hawaii",
    text: "For your protection, Hawaii law requires you to be informed that presenting a fraudulent claim for payment of a loss or benefit is a crime punishable by fines or imprisonment, or both.",
  },
  {
    state: "Kentucky",
    text: "Any person who knowingly and with intent to defraud any insurance company or other person files an application for insurance containing any materially false information or conceals, for the purpose of misleading, information concerning any fact material thereto commits a fraudulent insurance act, which is a crime.",
  },
  {
    state: "Louisiana",
    text: "Any person who knowingly presents a false or fraudulent claim for payment of a loss or benefit or knowingly presents false information in an application for insurance is guilty of a crime and may be subject to fines and confinement in prison.",
  },
  {
    state: "Maine",
    text: "It is a crime to knowingly provide false, incomplete or misleading information to an insurance company for the purpose of defrauding the company. Penalties may include imprisonment, fines, or denial of insurance benefits.",
  },
  {
    state: "Maryland",
    text: "Any person who knowingly and willfully presents a false or fraudulent claim for payment of a loss or benefit or who knowingly and willfully presents false information in an application for insurance is guilty of a crime and may be subject to fines and confinement in prison.",
  },
  {
    state: "New Jersey",
    text: "Any person who includes any false or misleading information on an application for an insurance policy is subject to criminal and civil penalties.",
  },
  {
    state: "New Mexico",
    text: "Any person who knowingly presents a false or fraudulent claim for payment of a loss or benefit or knowingly presents false information in an application for insurance is guilty of a crime and may be subject to civil fines and criminal penalties.",
  },
  {
    state: "New York (Commercial — except automobile)",
    text: "Any person who knowingly and with intent to defraud any insurance company or other person files an application for insurance or statement of claim containing any materially false information, or conceals for the purpose of misleading, information concerning any fact material thereto, commits a fraudulent insurance act, which is a crime, and shall also be subject to a civil penalty not to exceed five thousand dollars and the stated value of the claim for each such violation.",
  },
  {
    state: "Ohio",
    text: "Any person who, with intent to defraud or knowing that he is facilitating a fraud against an insurer, submits an application or files a claim containing a false or deceptive statement is guilty of insurance fraud.",
  },
  {
    state: "Oklahoma",
    text: "WARNING: Any person who knowingly, and with intent to injure, defraud or deceive any insurer, makes any claim for the proceeds of an insurance policy containing any false, incomplete or misleading information is guilty of a felony.",
  },
  {
    state: "Pennsylvania",
    text: "Any person who knowingly and with intent to defraud any insurance company or other person files an application for insurance or statement of claim containing any materially false information or conceals for the purpose of misleading, information concerning any fact material thereto commits a fraudulent insurance act, which is a crime and subjects such person to criminal and civil penalties.",
  },
  {
    state: "Puerto Rico",
    text: "Any person who knowingly and with the intention to defraud includes false information in an application for insurance or file, assist or abet in the filing of a fraudulent claim to obtain payment of a loss or other benefit, or files more than one claim for the same loss or damage, commits a felony and if found guilty shall be punished for each violation with a fine of no less than five thousand dollars ($5,000), not to exceed ten thousand dollars ($10,000); or imprisoned for a fixed term of three (3) years, or both. If aggravating circumstances exist, the fixed jail term may be increased to a maximum of five (5) years; and if mitigating circumstances are present, the jail term may be reduced to a minimum of two (2) years.",
  },
  {
    state: "Rhode Island",
    text: "Any person who knowingly presents a false or fraudulent claim for payment of a loss or benefit or knowingly presents false information in an application for insurance is guilty of a crime and may be subject to fines and confinement in prison.",
  },
  {
    state: "Tennessee",
    text: "It is a crime to knowingly provide false, incomplete or misleading information to an insurance company for the purpose of defrauding the company. Penalties include imprisonment, fines and denial of insurance benefits.",
  },
  {
    state: "Virginia",
    text: "It is a crime to knowingly provide false, incomplete or misleading information to an insurance company for the purpose of defrauding the company. Penalties include imprisonment, fines and denial of insurance benefits.",
  },
  {
    state: "Washington",
    text: "It is a crime to knowingly provide false, incomplete or misleading information to an insurance company for the purpose of defrauding the company. Penalties include imprisonment, fines and denial of insurance benefits.",
  },
  {
    state: "West Virginia",
    text: "Any person who knowingly presents a false or fraudulent claim for payment of a loss or benefit or knowingly presents false information in an application for insurance is guilty of a crime and may be subject to fines and confinement in prison.",
  },
];

export default function FraudNoticePage() {
  return (
    <main className="legal-page" style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px" }}>
      <h1>Applicant Fraud Notice</h1>
      <p>
        These notices apply to applications for insurance submitted through
        tcg-insurance.com by BetterHelp Insurance and its appointed carriers. Please review the notice for your
        state before signing the declaration.
      </p>
      <div style={{ marginTop: 32 }}>
        {NOTICES.map((n) => (
          <section key={n.state} style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 16, marginBottom: 6 }}>Notice to {n.state} applicants</h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#333" }}>{n.text}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
