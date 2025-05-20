import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DeliveryAddressForm } from '@/components/shared/DeliveryAddress';
import { usePatient } from '@/components/hooks/data';

const USPS_BASE_URL = 'https://secure.shippingapis.com/ShippingAPI.dll';
const USPS_USER_ID = '9ZEALT7857X29';

interface FormAddress {
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null | undefined;
}
interface AddressProps {
  loading: boolean;
  onSave: (formData: FormAddress) => void;
  onCancel: () => void;
}

function AddressUpdate({ onCancel }: AddressProps) {
  const { data: patient } = usePatient();
  return (
    <Stack gap="16px">
      <Typography
        variant="h3"
        sx={{
          fontSize: '18px !important',
          fontWeight: '600',
          lineHeight: '26px !important',
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        {'Delivery address'}
      </Typography>
      {patient ? (
        <DeliveryAddressForm onSuccess={onCancel} patient={patient} />
      ) : null}
      <Button
        fullWidth
        color="grey"
        sx={{ fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}
        onClick={onCancel}
      >
        Cancel
      </Button>
      {/* <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "16px",
          padding: "24px",
          background: "#FFFFFF",
          border: "1px solid #D8D8D8",
          borderRadius: "16px",
        }}
      >
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="address_line_1">Street Address</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={formData?.address_line_1}
            name="address_line_1"
            id="address-line-1"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="address_line_2">
            Apt, suite, unit, bldg (optional)
          </InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={formData?.address_line_2}
            name="address_line_2"
            id="address-line-2"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="city">City</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={formData?.city}
            name="city"
            id="city"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <Box
          sx={{
            display: "grid",
            width: "100%",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <FormControl variant="filled" fullWidth required>
            <InputLabel htmlFor="state">State</InputLabel>
            <Select
              labelId="state"
              id="state"
              name="state"
              value={formData.state}
              disableUnderline={true}
              onChange={handleOnChange}
              style={{ textAlign: "left" }}
            >
              {UsStates.map((option) => (
                <MenuItem key={option.name} value={option.abbreviation}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="filled" fullWidth required>
            <InputLabel htmlFor="zip-code">ZIP</InputLabel>
            <FilledInput
              fullWidth
              disableUnderline={true}
              value={formData?.zip_code}
              type="number"
              inputMode="numeric"
              name="zip_code"
              id="zip-code"
              onChange={handleOnChange}
              required
              sx={{
                "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
                  {
                    "-webkit-appearance": "none",
                    margin: 0,
                  },
              }}
            />
          </FormControl>
        </Box>
        <Stack width="100%">
          <ErrorMessage>{error}</ErrorMessage>
          <LoadingButton
            loading={loading}
            disabled={!allValid()}
            fullWidth
            onClick={() => onSubmit()}
            sx={{
              fontWeight: "600",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "1rem",
            }}
          >
            Confirm changes
          </LoadingButton>
        </Stack>
      </Box>
      <Modal
        open={showSuggestedAddress}
        onClose={() => setShowSuggestedAddress(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.default",
            minWidth: 350,
            maxHeight: "100%",
            overflow: "auto",
            p: 4,
            outline: "none",
            borderRadius: "16px",
          }}
        >
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h3">Verify your address</Typography>
            <IconButton onClick={() => setShowSuggestedAddress(false)}>
              <Close />
            </IconButton>
          </Stack>
          <Divider />
          <Typography variant="h4" margin="1rem 0">
            {`Using an unverified address may cause issues with medication
              delivery (if prescribed). Please consider using suggested address below.`}
          </Typography>
          <Typography variant="h3">You entered:</Typography>

          <Box
            display="grid"
            gridTemplateColumns="25px 1fr"
            gap="15px"
            margin="1rem 0"
            onClick={() => setSelectedOption("entered")}
            style={{ cursor: "pointer" }}
          >
            <Radio
              checked={selectedOption === "entered"}
              onChange={handleSelect}
              value="entered"
              name="radio-buttons"
              inputProps={{ "aria-label": "you entered" }}
              disableRipple={true}
            />
            <Stack gap={1}>
              <Typography style={{ fontSize: "15px" }}>
                {formData.address_line_1}
              </Typography>
              {formData?.address_line_2 && (
                <Typography style={{ fontSize: "15px" }}>
                  {formData.address_line_2}
                </Typography>
              )}
              <Typography style={{ fontSize: "15px" }}>
                {formData.city}
                {", "}
                {formData.state} {formData.zip_code}
              </Typography>
            </Stack>
          </Box>
          <Divider />

          <Typography margin="1rem 0" variant="h3">
            We suggest:
          </Typography>
          <Box
            display="grid"
            gridTemplateColumns="25px 1fr"
            gap="15px"
            onClick={() => setSelectedOption("suggested")}
            style={{ cursor: "pointer" }}
          >
            <Radio
              checked={selectedOption === "suggested"}
              onChange={handleSelect}
              value="suggested"
              name="radio-buttons"
              inputProps={{ "aria-label": "we suggest" }}
              disableRipple={true}
            />
            <Stack gap={1}>
              <Typography style={{ fontSize: "15px" }}>
                {suggestedAddress.address_line_1}
              </Typography>
              {suggestedAddress?.address_line_2 && (
                <Typography style={{ fontSize: "15px" }}>
                  {suggestedAddress.address_line_2}
                </Typography>
              )}
              <Typography style={{ fontSize: "15px" }}>
                {suggestedAddress.city}
                {", "}
                {suggestedAddress.state} {suggestedAddress.zip_code}
              </Typography>
            </Stack>
          </Box>

          <Button
            size="small"
            style={{ marginTop: "2rem" }}
            fullWidth
            onClick={() =>
              onSave(
                selectedOption === "suggested" ? suggestedAddress : formData
              )
            }
          >
            Use selected address
          </Button>
        </Box> */}
      {/* </Modal> */}
    </Stack>
  );
}

export default AddressUpdate;
