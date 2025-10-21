import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button, Box, TextField, Container, Card, TableContainer, Paper, Table, TableHead, TableRow, Modal, TableCell, Typography, FormControl, FormHelperText, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from "@mui/material";
import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import SchoolIcon from "@mui/icons-material/School";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import InfoIcon from "@mui/icons-material/Info";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderIcon from '@mui/icons-material/Folder';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ListAltIcon from "@mui/icons-material/ListAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import PsychologyIcon from "@mui/icons-material/Psychology";
import HowToRegIcon from '@mui/icons-material/HowToReg';
import UploadFileIcon from '@mui/icons-material/UploadFile'; 
import ExamPermit from "../applicant/ExamPermit";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";


const RegistrarDashboard5 = () => {
    const stepsData = [
       { label: "Medical Applicant List", to: "/medical_applicant_list", icon: <ListAltIcon /> },
         { label: "Applicant Form", to: "/medical_dashboard1", icon: <HowToRegIcon /> },
         { label: "Submitted Documents", to: "/medical_requirements", icon: <UploadFileIcon /> }, // updated icon
         { label: "Medical History", to: "/medical_requirements_form", icon: <PersonIcon /> },
         { label: "Dental Assessment", to: "/dental_assessment", icon: <DescriptionIcon /> },
         { label: "Physical and Neurological Examination", to: "/physical_neuro_exam", icon: <SchoolIcon /> },
    ];
    const [currentStep, setCurrentStep] = useState(4);
    const [visitedSteps, setVisitedSteps] = useState(Array(stepsData.length).fill(false));

    const fetchByPersonId = async (personID) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/person_with_applicant/${personID}`);
            setPerson(res.data);
            setSelectedPerson(res.data);
            if (res.data?.applicant_number) {
            }
        } catch (err) {
            console.error("❌ person_with_applicant failed:", err);
        }
    };

    const handleNavigateStep = (index, to) => {
        setCurrentStep(index);

        const pid = sessionStorage.getItem("admin_edit_person_id");
        if (pid) {
            navigate(`${to}?person_id=${pid}`);
        } else {
            navigate(to);
        }
    };


    const navigate = useNavigate();
    const [explicitSelection, setExplicitSelection] = useState(false);

    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [selectedPerson, setSelectedPerson] = useState(null);

    const [person, setPerson] = useState({
        termsOfAgreement: "",
    });


    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const queryPersonId = queryParams.get("person_id");

    useEffect(() => {
        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const loggedInPersonId = localStorage.getItem("person_id");
        const searchedPersonId = sessionStorage.getItem("admin_edit_person_id");

        if (!storedUser || !storedRole || !loggedInPersonId) {
            window.location.href = "/login";
            return;
        }

        setUser(storedUser);
        setUserRole(storedRole);

        // Roles that can access
        const allowedRoles = ["registrar", "applicant", "superadmin"];
        if (allowedRoles.includes(storedRole)) {
            // ✅ Always take URL param first
            const targetId = queryPersonId || searchedPersonId || loggedInPersonId;

            // Save it so other pages (ECAT, forms) can use it
            sessionStorage.setItem("admin_edit_person_id", targetId);

            setUserID(targetId);
            fetchPersonData(targetId);
            return;
        }

        window.location.href = "/login";
    }, [queryPersonId]);

    useEffect(() => {
        let consumedFlag = false;

        const tryLoad = async () => {
            if (queryPersonId) {
                await fetchByPersonId(queryPersonId);
                setExplicitSelection(true);
                consumedFlag = true;
                return;
            }

            // fallback only if it's a fresh selection from Applicant List
            const source = sessionStorage.getItem("admin_edit_person_id_source");
            const tsStr = sessionStorage.getItem("admin_edit_person_id_ts");
            const id = sessionStorage.getItem("admin_edit_person_id");
            const ts = tsStr ? parseInt(tsStr, 10) : 0;
            const isFresh = source === "applicant_list" && Date.now() - ts < 5 * 60 * 1000;

            if (id && isFresh) {
                await fetchByPersonId(id);
                setExplicitSelection(true);
                consumedFlag = true;
            }
        };

        tryLoad().finally(() => {
            // consume the freshness so it won't auto-load again later
            if (consumedFlag) {
                sessionStorage.removeItem("admin_edit_person_id_source");
                sessionStorage.removeItem("admin_edit_person_id_ts");
            }
        });
    }, [queryPersonId]);




       const steps = person.person_id
           ? [
               { label: "Personal Information", icon: <PersonIcon />, path: `/medical_dashboard1?person_id=${userID}` },
               { label: "Family Background", icon: <FamilyRestroomIcon />, path: `/medical_dashboard2?person_id=${userID}` },
               { label: "Educational Attainment", icon: <SchoolIcon />, path: `/medical_dashboard3?person_id=${userID}` },
               { label: "Health Medical Records", icon: <HealthAndSafetyIcon />, path: `/medical_dashboard4?person_id=${userID}` },
               { label: "Other Information", icon: <InfoIcon />, path: `/medical_dashboard5?person_id=${userID}` },
           ]
           : [];
   


    const [activeStep, setActiveStep] = useState(4);

    // Do not alter
    const fetchPersonData = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/person/${id}`);
            setPerson(res.data);
        } catch (error) { }
    };
    // Do not alter
    const handleUpdate = async (updatedData) => {
        if (!person || !person.person_id) return;

        try {
            await axios.put(`http://localhost:5000/api/person/${person.person_id}`, updatedData);
            console.log("✅ Auto-saved successfully");
        } catch (error) {
            console.error("❌ Auto-save failed:", error);
        }
    };
    // Real-time save on every character typed
    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        const updatedPerson = {
            ...person,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        };
        setPerson(updatedPerson);
        handleUpdate(updatedPerson); // No delay, real-time save
    };


    const handleBlur = async () => {
        try {
            await axios.put(`http://localhost:5000/api/person/${userID}`, person);
            console.log("Auto-saved");
        } catch (err) {
            console.error("Auto-save failed", err);
        }
    };

    const [errors, setErrors] = useState({});
    const isFormValid = () => {
        let newErrors = {};
        let isValid = true;

        if (person.termsOfAgreement !== 1) {
            newErrors.termsOfAgreement = true;
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };


    const [clickedSteps, setClickedSteps] = useState(Array(steps.length).fill(false));

    const handleStepClick = (index) => {
        setActiveStep(index);
        const newClickedSteps = [...clickedSteps];
        newClickedSteps[index] = true;
        setClickedSteps(newClickedSteps);
    };


    const divToPrintRef = useRef();
    const [showPrintView, setShowPrintView] = useState(false);

    const printDiv = () => {
        const divToPrint = divToPrintRef.current;
        if (divToPrint) {
            const newWin = window.open("", "Print-Window");
            newWin.document.open();
            newWin.document.write(`
        <html>
          <head>
            <title>Examination Permit</title>
            <style>
              @page { size: A4; margin: 0; }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                margin-left: "
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .print-container {
                width: 8.5in;
                min-height: 11in;
                margin: auto;
                background: white;
              }
              * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            </style>
          </head>
          <body onload="window.print(); setTimeout(() => window.close(), 100);">
            <div class="print-container">${divToPrint.innerHTML}</div>
          </body>
        </html>
      `);
            newWin.document.close();
        }
    };


    const [examPermitError, setExamPermitError] = useState("");
    const [examPermitModalOpen, setExamPermitModalOpen] = useState(false);

    const handleCloseExamPermitModal = () => {
        setExamPermitModalOpen(false);
        setExamPermitError("");
    };

    const handleExamPermitClick = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/verified-exam-applicants");
            const verified = res.data.some(a => a.person_id === parseInt(userID));

            if (!verified) {
                setExamPermitError("❌ You cannot print the Exam Permit until all required documents are verified.");
                setExamPermitModalOpen(true);
                return;
            }

            // ✅ Render permit and print
            setShowPrintView(true);
            setTimeout(() => {
                printDiv();
                setShowPrintView(false);
            }, 500);
        } catch (err) {
            console.error("Error verifying exam permit eligibility:", err);
            setExamPermitError("⚠️ Unable to check document verification status right now.");
            setExamPermitModalOpen(true);
        }
    };


    const links = [
        { to: `/admin_ecat_application_form`, label: "ECAT Application Form" },
        { to: `/admission_form_process`, label: "Admission Form Process" },
        { to: `/admin_personal_data_form`, label: "Personal Data Form" },
        { to: `/admin_office_of_the_registrar`, label: "Application For EARIST College Admission" },
        { to: `/admission_services`, label: "Application/Student Satisfactory Survey" },
        { label: "Examination Permit", onClick: handleExamPermitClick }, // ✅
    ];



    const [canPrintPermit, setCanPrintPermit] = useState(false);

    useEffect(() => {
        if (!userID) return;
        axios.get("http://localhost:5000/api/verified-exam-applicants")
            .then(res => {
                const verified = res.data.some(a => a.person_id === parseInt(userID));
                setCanPrintPermit(verified);
            });
    }, [userID]);


    // dot not alter
    return (
        <Box sx={{ height: 'calc(100vh - 140px)', overflowY: 'auto', paddingRight: 1, backgroundColor: 'transparent' }}>

            {showPrintView && (
                <div ref={divToPrintRef} style={{ display: "block" }}>
                    <ExamPermit personId={userID} />   {/* ✅ pass the searched person_id */}
                </div>
            )}


            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    mt: 3,
                    mb: 2,
                    px: 2,
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 'bold',
                        color: 'maroon',
                        fontSize: '36px',
                    }}
                >
                   APPLICANT FORM - OTHER INFORMATION
                </Typography>
            </Box>
            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "nowrap", // prevent wrapping
                    width: "100%",
                    mt: 3,

                }}
            >
                {stepsData.map((step, index) => (
                    <React.Fragment key={index}>
                        {/* Step Card */}
                        <Card
                            onClick={() => handleNavigateStep(index, step.to)}
                            sx={{
                                flex: `1 1 ${100 / stepsData.length}%`, // evenly divide width
                                height: 120,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                borderRadius: 2,
                                border: "2px solid #6D2323",
                                backgroundColor: currentStep === index ? "#6D2323" : "#E8C999",
                                color: currentStep === index ? "#fff" : "#000",
                                boxShadow:
                                    currentStep === index
                                        ? "0px 4px 10px rgba(0,0,0,0.3)"
                                        : "0px 2px 6px rgba(0,0,0,0.15)",
                                transition: "0.3s ease",
                                "&:hover": {
                                    backgroundColor: currentStep === index ? "#5a1c1c" : "#f5d98f",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <Box sx={{ fontSize: 40, mb: 1 }}>{step.icon}</Box>
                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}
                                >
                                    {step.label}
                                </Typography>
                            </Box>
                        </Card>

                        {/* Spacer (line gap between steps) */}
                        {index < stepsData.length - 1 && (
                            <Box
                                sx={{
                                    flex: 0.05,
                                    mx: 1, // spacing between cards
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </Box>


            <br />



            <TableContainer component={Paper} sx={{ width: '100%', mb: 1 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#6D2323' }}>
                        <TableRow>
                            {/* Left cell: Applicant ID */}
                            <TableCell sx={{ color: 'white', fontSize: '20px', fontFamily: 'Arial Black', border: 'none' }}>
                                Applicant ID:&nbsp;
                                <span style={{ fontFamily: "Arial", fontWeight: "normal", textDecoration: "underline" }}>
                                    {person?.applicant_number || "N/A"}

                                </span>
                            </TableCell>

                            {/* Right cell: Applicant Name */}
                            <TableCell
                                align="right"
                                sx={{ color: 'white', fontSize: '20px', fontFamily: 'Arial Black', border: 'none' }}
                            >
                                Applicant Name:&nbsp;
                                <span style={{ fontFamily: "Arial", fontWeight: "normal", textDecoration: "underline" }}>
                                    {person?.last_name?.toUpperCase()}, {person?.first_name?.toUpperCase()}{" "}
                                    {person?.middle_name?.toUpperCase()} {person?.extension?.toUpperCase() || ""}
                                </span>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>



            <Box sx={{ display: "flex", width: "100%" }}>
                {/* Left side: Notice */}
                <Box sx={{ width: "100%", padding: "10px" }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2,
                            borderRadius: "10px",
                            backgroundColor: "#fffaf5",
                            border: "1px solid #6D2323",
                            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                            whiteSpace: "nowrap", // Keep all in one row
                        }}
                    >
                        {/* Icon */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#6D2323",
                                borderRadius: "8px",
                                width: 40,
                                height: 40,
                                flexShrink: 0,
                            }}
                        >
                            <ErrorIcon sx={{ color: "white", fontSize: 28 }} />
                        </Box>

                        {/* Notice Text */}
                        <Typography
                            sx={{
                                fontSize: "15px",
                                fontFamily: "Arial",
                                color: "#3e3e3e",
                            }}
                        >
                            <strong style={{ color: "maroon" }}>Notice:</strong> &nbsp;
                            <strong>1.</strong> Kindly type <strong>'NA'</strong> in boxes where there are no possible answers to the information being requested. &nbsp; | &nbsp;
                            <strong>2.</strong> To use the letter <strong>'Ñ'</strong>, press <kbd>ALT</kbd> + <kbd>165</kbd>; for <strong>'ñ'</strong>, press <kbd>ALT</kbd> + <kbd>164</kbd>. &nbsp; | &nbsp;
                            <strong>3.</strong> This is the list of all printable files.
                        </Typography>
                    </Box>
                </Box>


            </Box>

            {/* Cards Section */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    mt: 2,
                    pb: 1,
                    justifyContent: "center", // Centers all cards horizontally
                }}
            >
                {links.map((lnk, i) => (
                    <motion.div
                        key={i}
                        style={{ flex: "0 0 calc(30% - 16px)" }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                        <Card
                            sx={{
                                minHeight: 60,
                                borderRadius: 2,
                                border: "2px solid #6D2323",
                                backgroundColor: "#fff",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                p: 1.5,
                                cursor: "pointer",
                                transition: "all 0.3s ease-in-out",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    backgroundColor: "#6D2323", // ✅ background becomes maroon
                                    "& .card-text": {
                                        color: "#fff", // ✅ text becomes white
                                    },
                                    "& .card-icon": {
                                        color: "#fff", // ✅ icon becomes white
                                    },
                                },
                            }}
                            onClick={() => {
                                if (lnk.onClick) {
                                    lnk.onClick(); // run handler
                                } else if (lnk.to) {
                                    navigate(lnk.to); // navigate if it has a `to`
                                }
                            }}
                        >
                            {/* Icon */}
                            <PictureAsPdfIcon
                                className="card-icon"
                                sx={{ fontSize: 35, color: "#6D2323", mr: 1.5 }}
                            />

                            {/* Label */}
                            <Typography
                                className="card-text"
                                sx={{
                                    color: "#6D2323",
                                    fontFamily: "Arial",
                                    fontWeight: "bold",
                                    fontSize: "0.85rem",
                                }}
                            >
                                {lnk.label}
                            </Typography>
                        </Card>
                    </motion.div>
                ))}
            </Box>


            <Container maxWidth="lg">

                <Container>
                    <h1 style={{ fontSize: "50px", fontWeight: "bold", textAlign: "center", color: "maroon", marginTop: "25px" }}>
                        APPLICANT FORM
                    </h1>
                    <div style={{ textAlign: "center" }}>
                        Complete the applicant form to secure your place for the upcoming academic year at EARIST.
                    </div>
                </Container>
                <br />
                {person.person_id && (
                    <Box sx={{ display: "flex", justifyContent: "center", width: "100%", px: 4 }}>
                        {steps.map((step, index) => (
                            <React.Fragment key={index}>
                                {/* Wrap the step with Link for routing */}
                                <Link to={step.path} style={{ textDecoration: "none" }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => handleStepClick(index)}
                                    >
                                        {/* Step Icon */}
                                        <Box
                                            sx={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: "50%",
                                                backgroundColor: activeStep === index ? "#6D2323" : "#E8C999",
                                                color: activeStep === index ? "#fff" : "#000",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {step.icon}
                                        </Box>

                                        {/* Step Label */}
                                        <Typography
                                            sx={{
                                                mt: 1,
                                                color: activeStep === index ? "#6D2323" : "#000",
                                                fontWeight: activeStep === index ? "bold" : "normal",
                                                fontSize: 14,
                                            }}
                                        >
                                            {step.label}
                                        </Typography>
                                    </Box>
                                </Link>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <Box
                                        sx={{
                                            height: "2px",
                                            backgroundColor: "#6D2323",
                                            flex: 1,
                                            alignSelf: "center",
                                            mx: 2,
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </Box>
                )}
                <br />
                <form>
                    <Container maxWidth="100%" sx={{ backgroundColor: "#6D2323", border: "2px solid black", color: "white", borderRadius: 2, boxShadow: 3, padding: "4px" }}>
                        <Box sx={{ width: "100%" }}>
                            <Typography style={{ fontSize: "20px", padding: "10px", fontFamily: "Arial Black" }}>Step 5: Other Information</Typography>
                        </Box>
                    </Container>
                    <Container maxWidth="100%" sx={{ backgroundColor: "#f1f1f1", border: "2px solid black", padding: 4, borderRadius: 2, boxShadow: 3 }}>
                        <Typography style={{ fontSize: "20px", color: "#6D2323", fontWeight: "bold" }}>
                            Other Information:
                        </Typography>
                        <hr style={{ border: "1px solid #ccc", width: "100%" }} />
                        <Typography style={{ fontWeight: "bold", textAlign: "Center" }}>
                            Data Subject Consent Form
                        </Typography>
                        < br />
                        <Typography style={{ fontSize: "12px", fontFamily: "Arial", textAlign: "Left" }}>
                            In accordance with RA 10173 or Data Privacy Act of 2012, I give my consent to the following terms and conditions on the collection, use, processing, and disclosure of my personal data:
                        </Typography>
                        < br />
                        <Typography style={{ fontSize: "12px", fontFamily: "Arial", textAlign: "Left" }}>
                            1. I am aware that the Eulogio "Amang" Rodriguez Institute of Science and Technology (EARIST) has collected and stored my personal data during my admission/enrollment at EARIST. This data includes my demographic profile, contact details like home address, email address, landline numbers, and mobile numbers.
                        </Typography>
                        <Typography style={{ fontSize: "12px", fontFamily: "Arial", textAlign: "Left" }}>
                            2. I agree to personally update these data through personal request from the Office of the registrar.
                        </Typography>
                        <Typography style={{ fontSize: "12px", fontFamily: "Arial", textAlign: "Left" }}>
                            3. In consonance with the above stated Act, I am aware that the University will protect my school records related to my being a student/graduated of EARIST. However, I have the right to authorize a representative to claim the same subject to the policy of the University.
                        </Typography>

                        <Typography style={{ fontSize: "12px", fontFamily: "Arial", textAlign: "Left" }}>
                            4. In order to promote efficient management of the organization’s records, I authorize the University to manage my data for data sharing with industry partners, government agencies/embassies, other educational institutions, and other offices for the university for employment, statistics, immigration, transfer credentials, and other legal purposes that may serve me best.
                        </Typography>
                        < br />
                        <Typography style={{ fontSize: "12px", fontFamily: "Arial", textAlign: "Left" }}>
                            By clicking the submit button, I warrant that I have read, understood all of the above provisions, and agreed to its full implementation.
                        </Typography>
                        <br />
                        <hr style={{ border: "1px solid #ccc", width: "100%" }} />
                        < br />
                        <Typography style={{ fontSize: "12px", fontFamily: "Arial", textAlign: "Left" }}>
                            I certify that the information given above are true, complete, and accurate to the best of my knowledge and belief. I promise to abide by the rules and regulations of Eulogio "Amang" Rodriguez Institute of Science and Technology regarding the ECAT and my possible admission. I am aware that any false or misleading information and/or statement may result in the refusal or disqualification of my admission to the institution.
                        </Typography>

                        <FormControl required error={!!errors.termsOfAgreement} component="fieldset" sx={{ mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="termsOfAgreement"
                                        disabled
                                        checked={person.termsOfAgreement === 1}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                }
                                label="I agree Terms of Agreement"
                            />
                            {errors.termsOfAgreement && (
                                <FormHelperText>This field is required.</FormHelperText>
                            )}
                        </FormControl>


                        <Modal
                            open={examPermitModalOpen}
                            onClose={handleCloseExamPermitModal}
                            aria-labelledby="exam-permit-error-title"
                            aria-describedby="exam-permit-error-description"
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: 400,
                                    bgcolor: "background.paper",
                                    border: "2px solid #6D2323",
                                    boxShadow: 24,
                                    p: 4,
                                    borderRadius: 2,
                                    textAlign: "center",
                                }}
                            >
                                <ErrorIcon sx={{ color: "#6D2323", fontSize: 50, mb: 2 }} />
                                <Typography id="exam-permit-error-title" variant="h6" component="h2" color="maroon">
                                    Exam Permit Notice
                                </Typography>
                                <Typography id="exam-permit-error-description" sx={{ mt: 2 }}>
                                    {examPermitError}
                                </Typography>
                                <Button
                                    onClick={handleCloseExamPermitModal}
                                    variant="contained"
                                    sx={{ mt: 3, backgroundColor: "#6D2323", "&:hover": { backgroundColor: "#8B0000" } }}
                                >
                                    Close
                                </Button>
                            </Box>
                        </Modal>







                        <Box display="flex" justifyContent="space-between" mt={4}>
                            {/* Previous Page Button */}
                            <Button
                                variant="contained"
                                component={Link}
                                to="/medical_dashboard4"
                                startIcon={
                                    <ArrowBackIcon
                                        sx={{
                                            color: '#000',
                                            transition: 'color 0.3s',
                                        }}
                                    />
                                }
                                sx={{
                                    backgroundColor: '#E8C999',
                                    color: '#000',
                                    '&:hover': {
                                        backgroundColor: '#6D2323',
                                        color: '#fff',
                                        '& .MuiSvgIcon-root': {
                                            color: '#fff',
                                        },
                                    },
                                }}
                            >
                                Previous Step
                            </Button>
                            {/* Next Step (Submit) Button */}
                            <Button
                                variant="contained"
                                onClick={(e) => {
                                    handleUpdate(); // Save data

                                    if (isFormValid()) {
                                        navigate("/student_requirements"); // Proceed only if valid
                                    } else {
                                        alert("Please complete all required fields before submitting.");
                                    }
                                }}
                                endIcon={
                                    <FolderIcon
                                        sx={{
                                            color: '#fff',
                                            transition: 'color 0.3s',
                                        }}
                                    />
                                }
                                sx={{
                                    backgroundColor: '#6D2323',
                                    color: '#fff',
                                    '&:hover': {
                                        backgroundColor: '#E8C999',
                                        color: '#000',
                                        '& .MuiSvgIcon-root': {
                                            color: '#000',
                                        },
                                    },
                                }}
                            >
                                Submit (Save Information)
                            </Button>


                        </Box>


                    </Container>

                </form>

            </Container>


        </Box>

    );
};


export default RegistrarDashboard5;
