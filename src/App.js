import React, { useState } from "react";
import "./styles.css";
import { Button } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import { useForm } from "react-hook-form";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

const App = () => {
  const { errors, register, handleSubmit } = useForm();
  const [labelValue, setLabelValue] = useState("");
  const [blnShowProgress, setBlnShowProgress] = useState(false);
  const [algo, setAlgo] = useState("");
  const [methodList, setMethodList] = useState(null);
  const [additionalData, setAdditionalData] = useState("");
  // JSON.parse( `
  //[{"group": "grp_0", "probability": 1.0000100135803223}, {"group": "grp_24", "probability": 1.0000003385357559e-05}, {"group": "grp_9", "probability": 1.0000003385357559e-05}]
  // `)

  if (!methodList) {
    axios.get("/getPredictMethods").then((response) => {
      console.log("Method list received", response.data);
      setMethodList(response.data);
    });
  }

  const handleChange = (event) => {
    setAlgo(event.target.value);
  };

  const onSubmit = (data) => {
    console.log(data);
    setLabelValue("");
    setAdditionalData("");
    setBlnShowProgress(true);
    console.log("dropdown selected", algo);
    axios.post("/" + algo, { query: data.inputfield }).then(
      (res) => {
        console.log("response", res);
        if (res.data) {
          setLabelValue(res.data.group);
          console.log('res.data ', res.data);
          if (res.data.additionalData) {
            setAdditionalData(JSON.parse(res.data.additionalData));
          }
        }
        setBlnShowProgress(false);
      },
      (error) => {
        console.log("error", error);
        setBlnShowProgress(false);
      }
    );
  };

  const gridHtml = () => {
    if (additionalData) {
      return (
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Group</TableCell>
                <TableCell align="center">Probability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {additionalData.map((row) => (
                <TableRow key={row.group}>
                  <TableCell align="center">{row.group}</TableCell>
                  <TableCell align="center">{row.probability}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    return null;
  };

  if (!algo && methodList && methodList.length > 0) {
    setAlgo(methodList[0].displayname);
  }

  const methodListHtml = () => {
    if (!methodList) {
      return null;
    }
    return methodList.map((item) => (
      <MenuItem value={item.method}>{item.displayname} </MenuItem>
    ));
    //return null;
  };

  const progressBar = () => {
    if (!blnShowProgress) {
      return null;
    }
    return <CircularProgress color="secondary" />;
  };
  return (
    <div className="App" style={{ margin: 0, padding: 0 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">NLP APP</Typography>
        </Toolbar>
      </AppBar>
      <p>
        Enter issue description and app will tell you which group shall resolve
        it
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl style={{ minWidth: 220 }}>
          <InputLabel id="demo-controlled-open-select-label">
            Select Algorithm
          </InputLabel>
          <Select
            name="algo"
            ref={register}
            labelId="demo-customized-select-label"
            id="demo-customized-select"
            value={algo}
            onChange={handleChange}
          >
            {methodListHtml()}
          </Select>
        </FormControl>
        <br/>

        <FormControl style={{width: 500}}>
          <TextField
            inputRef={register({ required: true })} // pattern: /^[A-Za-z0-9\s]+$/i
            name="inputfield"
            id="standard-full-width"
            label="Issue Description"
            style={{ margin: 8 }}
            placeholder="Enter Description here"
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          {errors.inputfield && "Input cannot be empty"}
        </FormControl>

        <br />
        <Button color="primary" type="submit">
          Get Group
        </Button>
        <br />
        {progressBar()}
      </form>

      <p>{labelValue}</p>
      <div style={{ height: 400, maxWidth: 500, margin: "auto" }}>
        {gridHtml()}
      </div>
    </div>
  );
};

export default App;
