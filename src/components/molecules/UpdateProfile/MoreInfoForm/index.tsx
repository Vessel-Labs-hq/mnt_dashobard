import React, { FC, useEffect, useState } from "react";
import Input from "@/components/atoms/Input";
import ComboBox, { DataProps } from "@/components/atoms/ComboBox";
import PhoneInput from "@/components/atoms/PhoneInput";
import Button from "@/components/atoms/Button";
import { countryArrray } from "@/components/constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/Popover";
import { format } from "date-fns";
import { Formik, FormikHelpers } from "formik";
import { CreateUserSchema } from "@/base/helpers/FormValidationSchemas";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { Calendar } from "../../Calendar";

interface FormUserInfo {
  firstName: string;
  lastName: string;
  mothersName: string;
  homeTown: string;
}

const fields = [
  {
    label: "Enter your first name",
    name: "firstName",
    placeholder: "First Name",
    Component: Input,
  },
  {
    label: "Enter your last name",
    name: "lastName",
    placeholder: "Last Name",
    Component: Input,
  },

  {
    label: "Enter your Home Town",
    name: "homeTown",
    placeholder: "Enter your Home Town",
    Component: Input,
  },

  {
    label: "Enter your mother's maiden name",
    name: "mothersName",
    placeholder: "Mother's maiden name ",
    Component: Input,
  },
] as const;

const MoreInfoForm: FC = () => {
  const { data: session } = useSession();
  const [phoneNumber, setPhoneNumber] = useState<E164Number>();
  const [date, setDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelctedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState<DataProps[]>([]);
  const countries = countryArrray.map(({ country }) => ({
    name: country,
    value: country,
  }));

  const handleFormSubmit = async (
    values: FormUserInfo,
    { resetForm }: FormikHelpers<FormUserInfo>
  ) => {
    const { firstName, lastName, mothersName, homeTown } = values;
    if (!phoneNumber || !selectedCountry || !selectedState) {
      console.log("errors");
      toast.error("Please fill all fields");
      return;
    }

    const personPayload = {
      firstName,
      lastName,
      middleName: "Sunnex",
      dateOfBirth: date ? format(date, "PPPP") : "",
      mothersMaidenName: mothersName,
      homeTown,
      phoneNumber,
      countryOfOrigin: selectedCountry,
      stateOfOrigin: selectedState,
      isUser: true,
    };

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/person`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
          body: JSON.stringify(personPayload),
        }
      );
      if (res.status === 200) {
        toast.success("Profile created successfully");
        const person = await res.json();
        console.log(person);
      }
      const person = await res.json();
      console.log(person);
    } catch (error) {
      toast.error("An error occurred");
      console.log(error);
    } finally {
      resetForm();
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      const filteredCountry = countryArrray.filter(
        ({ country }) => country === selectedCountry
      );

      const filteredState = filteredCountry[0].states.map((state) => ({
        name: state,
        value: state,
      }));

      setStates(filteredState);
    }
  }, [selectedCountry]);

  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        mothersName: "",
        homeTown: "",
      }}
      validationSchema={CreateUserSchema}
      onSubmit={handleFormSubmit}
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        errors,
        touched,
      }) => (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
            {fields.map(({ Component, name, label, placeholder }) => (
              <fieldset key={label}>
                <Component
                  name={name}
                  placeholder={placeholder}
                  label={label}
                  onChange={handleChange}
                  parentClass="w-full"
                  value={values[name]}
                  onBlur={handleBlur}
                  isError={!!(touched[name] && errors[name])}
                  hint={touched[name] && errors[name] ? errors[name] : ""}
                />
              </fieldset>
            ))}

            <div className="!text-light-slate-9 space-y-2">
              <p className="grid grid-cols-1 gap-2 text-sm text-black">
                Enter your date of birth
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-light-slate-9 flex w-full items-center gap-4 text-base"
                  >
                    <Input
                      disabled
                      placeholder="Date of birth"
                      value={date ? `${format(date, "PPP")}` : ""}
                      label=""
                      parentClass="w-full"
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto bg-white p-0">
                  <Calendar
                    // block user's from selecting a future date
                    toDate={new Date()}
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <ComboBox
              onSelect={(value) => {
                setSelctedCountry(value);
              }}
              label="Select country of origin "
              data={countries}
            />
            <ComboBox
              data={states}
              onSelect={(value) => {
                setSelectedState(value);
              }}
              label="Select state of origin "
            />
            <PhoneInput
              label="Enter your phone number"
              placeholder="(999) 999-9999"
              value={phoneNumber}
              onChange={setPhoneNumber}
            />
          </div>
          <Button loading={loading} className="mx-auto mt-8" type="submit">
            Continue
          </Button>
        </form>
      )}
    </Formik>
  );
};

export default MoreInfoForm;